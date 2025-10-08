
export interface SpeakerSummary {
  speaker: string;
  summary: string;
}

export interface ActionItem {
  item: string;
  assignedTo?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  transcript: string;
  speakerSummaries: SpeakerSummary[];
  actionItems: ActionItem[];
  overallSummary: string;
}

export interface GeminiAnalysisResult {
  transcript: string;
  overallSummary: string;
  speakerSummaries: SpeakerSummary[];
  actionItems: ActionItem[];
}
