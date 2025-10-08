import React from 'react';
import { Meeting } from '../types';

interface MeetingCardProps {
  meeting: Meeting;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

const PlusIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onView, onDelete }) => {
  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{meeting.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{new Date(meeting.date).toLocaleDateString()}</p>
            </div>
             <button
                onClick={(e) => { e.stopPropagation(); onDelete(meeting.id); }}
                className="p-2 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Delete meeting"
              >
                <TrashIcon />
              </button>
        </div>
        <p className="mt-4 text-slate-600 line-clamp-3 h-20">{meeting.overallSummary}</p>
      </div>
      <div className="bg-slate-50 px-6 py-4">
        <button
          onClick={() => onView(meeting.id)}
          className="w-full text-center font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
};


interface MeetingListProps {
  meetings: Meeting[];
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

const MeetingList: React.FC<MeetingListProps> = ({ meetings, onView, onDelete, onNew }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Your Meetings</h2>
        <button
          onClick={onNew}
          className="flex items-center justify-center bg-blue-600 text-white font-semibold py-3 px-5 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          <PlusIcon />
          New Analysis
        </button>
      </div>

      {meetings.length === 0 ? (
        <div className="text-center py-20 px-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-2xl font-semibold text-slate-700">No meetings yet.</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">Upload an audio file to get started and see the magic happen.</p>
            <button
                onClick={onNew}
                className="mt-8 bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
                Analyze First Meeting
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {meetings.map(meeting => (
            <MeetingCard key={meeting.id} meeting={meeting} onView={onView} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingList;