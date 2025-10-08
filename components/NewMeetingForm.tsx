import React, { useState } from 'react';
import { Meeting } from '../types';
import { analyzeAudio } from '../services/geminiService';
import Spinner from './Spinner';

interface NewMeetingFormProps {
  onSave: (meeting: Meeting) => void;
  onCancel: () => void;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const UploadIcon: React.FC = () => (
    <svg className="w-10 h-10 mb-4 text-slate-400 group-hover:text-blue-500 transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
    </svg>
);

export const NewMeetingForm: React.FC<NewMeetingFormProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      
      if (file.type !== 'audio/mpeg') {
        setError("Invalid file type. Please upload an MP3 file.");
        setAudioFile(null);
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File is too large. Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`);
        setAudioFile(null);
        return;
      }
      
      setAudioFile(file);
      setError(null);
    }
  };
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !audioFile) {
      setError('Title, date, and an MP3 audio file are required.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const analysisResult = await analyzeAudio(audioFile);
      const newMeeting: Meeting = {
        id: new Date().toISOString(),
        title,
        date,
        transcript: analysisResult.transcript,
        overallSummary: analysisResult.overallSummary,
        speakerSummaries: analysisResult.speakerSummaries,
        actionItems: analysisResult.actionItems,
      };
      onSave(newMeeting);
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred.");
        }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Spinner message="Transcribing and analyzing audio... This may take a moment." />}
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto animate-fade-in">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 border-b pb-4">New Meeting Analysis</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">Meeting Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="e.g., Q3 Project Kick-off"
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-2">Date</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Meeting Audio File
            </label>
            <div 
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`group mt-2 flex justify-center rounded-lg border-2 border-dashed border-slate-300 px-6 py-10 transition-colors ${isDragging ? 'bg-blue-50 border-blue-400' : 'bg-white'}`}>
                <div className="text-center">
                    <UploadIcon />
                    <div className="flex text-sm leading-6 text-gray-600">
                        <label htmlFor="audio-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500 transition">
                            <span>Upload a file</span>
                            <input id="audio-upload" name="audio-upload" type="file" className="sr-only" accept="audio/mpeg" onChange={(e) => handleFileChange(e.target.files)} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">MP3 up to 10MB</p>
                    {audioFile && (
                        <p className="text-sm font-semibold text-green-600 mt-4">
                            Selected file: {audioFile.name}
                        </p>
                    )}
                </div>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-3 bg-slate-100 text-slate-800 font-semibold rounded-lg hover:bg-slate-200 transition-all transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !audioFile || !title || !date}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Processing...' : 'Analyze & Save'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};