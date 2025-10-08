
import React, { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Meeting } from './types';
import Header from './components/Header';
import MeetingList from './components/MeetingList';
import MeetingDetails from './components/MeetingDetails';
import { NewMeetingForm } from './components/NewMeetingForm';

type View = 'list' | 'details' | 'new';

const App: React.FC = () => {
  const [meetings, setMeetings] = useLocalStorage<Meeting[]>('meetings', []);
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  const handleSaveMeeting = (meeting: Meeting) => {
    setMeetings(prevMeetings => {
      const existingIndex = prevMeetings.findIndex(m => m.id === meeting.id);
      if (existingIndex > -1) {
        const updatedMeetings = [...prevMeetings];
        updatedMeetings[existingIndex] = meeting;
        return updatedMeetings;
      }
      return [meeting, ...prevMeetings];
    });
    setCurrentView('list');
  };

  const handleDeleteMeeting = (id: string) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      setMeetings(prevMeetings => prevMeetings.filter(m => m.id !== id));
      if (selectedMeetingId === id) {
        setCurrentView('list');
        setSelectedMeetingId(null);
      }
    }
  };

  const handleViewMeeting = (id: string) => {
    setSelectedMeetingId(id);
    setCurrentView('details');
  };

  const selectedMeeting = useMemo(() => {
    return meetings.find(m => m.id === selectedMeetingId) || null;
  }, [meetings, selectedMeetingId]);

  const renderContent = () => {
    switch (currentView) {
      case 'new':
        return <NewMeetingForm onSave={handleSaveMeeting} onCancel={() => setCurrentView('list')} />;
      case 'details':
        if (selectedMeeting) {
          return (
            <MeetingDetails
              meeting={selectedMeeting}
              onBack={() => setCurrentView('list')}
              onDelete={handleDeleteMeeting}
            />
          );
        }
        // Fallback if no meeting is selected
        setCurrentView('list');
        return null;
      case 'list':
      default:
        return (
          <MeetingList
            meetings={meetings}
            onView={handleViewMeeting}
            onDelete={handleDeleteMeeting}
            onNew={() => setCurrentView('new')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;