import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    transcript: {
      type: Type.STRING,
      description: "The complete, verbatim transcript generated from the audio.",
    },
    overallSummary: {
      type: Type.STRING,
      description: "A concise, high-level summary of the entire meeting's purpose, key discussions, and outcomes.",
    },
    speakerSummaries: {
      type: Type.ARRAY,
      description: "A list of summaries, one for each speaker identified in the transcript.",
      items: {
        type: Type.OBJECT,
        properties: {
          speaker: {
            type: Type.STRING,
            description: "The identifier for the speaker (e.g., 'Speaker A', 'John Doe').",
          },
          summary: {
            type: Type.STRING,
            description: "A summary of the key points, arguments, and contributions made by this speaker.",
          },
        },
        required: ["speaker", "summary"],
      },
    },
    actionItems: {
      type: Type.ARRAY,
      description: "A list of clear, actionable tasks or follow-ups mentioned during the meeting.",
      items: {
        type: Type.OBJECT,
        properties: {
          item: {
            type: Type.STRING,
            description: "The specific action item or task to be completed.",
          },
          assignedTo: {
            type: Type.STRING,
            description: "The person or group responsible for the action item. If not specified, can be 'Unassigned'.",
          },
        },
        required: ["item"],
      },
    },
  },
  required: ["transcript", "overallSummary", "speakerSummaries", "actionItems"],
};

const fileToGenerativePart = (file: File): Promise<{inlineData: {data: string, mimeType: string}}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
            const base64Data = event.target.result.split(',')[1];
            if (!base64Data) {
              reject(new Error("Could not extract base64 data from file. The file might be corrupt or empty."));
              return;
            }
            resolve({
                inlineData: {
                    data: base64Data,
                    mimeType: file.type,
                }
            });
        } else {
            reject(new Error("Failed to read file content."));
        }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};


export const analyzeAudio = async (audioFile: File): Promise<GeminiAnalysisResult> => {
  try {
    const audioPart = await fileToGenerativePart(audioFile);

    const prompt = `
      You are an AI assistant for analyzing meeting audio.
      Process the attached audio file and generate a JSON object that strictly follows the provided schema.
      The JSON object must contain:
      1.  "transcript": The full, verbatim transcription of the audio.
      2.  "overallSummary": A high-level summary of the meeting.
      3.  "speakerSummaries": An array of summaries, one for each speaker identified.
      4.  "actionItems": An array of all actionable tasks mentioned.
      Your entire response must be only the JSON object. Do not include any other text or markdown formatting.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [{text: prompt}, audioPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema,
            // Prioritize speed for faster results by disabling the thinking budget.
            thinkingConfig: { thinkingBudget: 0 },
        },
    });
    
    const jsonText = response.text.trim();
    const parsedResult = JSON.parse(jsonText);

    if (
      !parsedResult.transcript ||
      !parsedResult.overallSummary || 
      !Array.isArray(parsedResult.speakerSummaries) ||
      !Array.isArray(parsedResult.actionItems)
    ) {
      throw new Error("AI response is missing required fields.");
    }
    
    return parsedResult as GeminiAnalysisResult;

  } catch (error: unknown) {
    console.error("Error analyzing audio with Gemini API:", error);
    
    let errorMessage = "Failed to process the meeting audio. Please ensure it's a clear MP3 file and try again.";
    
    const errorString = (error instanceof Error) ? error.message : String(error);

    if (errorString.toLowerCase().includes('unauthenticated') || errorString.includes('401')) {
      errorMessage = "Authentication failed. The API key may be invalid, missing, or lack the necessary permissions. Please check your configuration.";
    }

    throw new Error(errorMessage);
  }
};