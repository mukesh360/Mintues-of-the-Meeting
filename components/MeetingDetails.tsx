import React, { useState } from 'react';
import { Meeting } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MeetingDetailsProps {
  meeting: Meeting;
  onBack: () => void;
  onDelete: (id: string) => void;
}

const ArrowLeftIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
    </svg>
);

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const PDFIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm6 10a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2a.5.5 0 01.5-.5zM9 4.5a.5.5 0 01.5.5v5a.5.5 0 01-1 0v-5a.5.5 0 01.5-.5zM5 8a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2A.5.5 0 015 8zm8-2.5a.5.5 0 01.5.5v5a.5.5 0 01-1 0v-5a.5.5 0 01.5-.5z" clipRule="evenodd" />
    </svg>
);

const ClipboardIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
    </svg>
);

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const MeetingDetails: React.FC<MeetingDetailsProps> = ({ meeting, onBack, onDelete }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(meeting.transcript);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const margin = 15;
    let yPos = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    const titleLines = doc.splitTextToSize(meeting.title, doc.internal.pageSize.width - margin * 2);
    doc.text(titleLines, margin, yPos);
    yPos += titleLines.length * 8 + 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Date: ${new Date(meeting.date).toDateString()}`, margin, yPos);
    yPos += 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Overall Summary", margin, yPos);
    yPos += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(50);
    const summaryLines = doc.splitTextToSize(meeting.overallSummary, doc.internal.pageSize.width - margin * 2);
    doc.text(summaryLines, margin, yPos);
    yPos += summaryLines.length * 5 + 10;

    if (meeting.actionItems.length > 0) {
      autoTable(doc, {
          startY: yPos,
          head: [['Action Item', 'Assigned To']],
          body: meeting.actionItems.map(item => [item.item, item.assignedTo || 'Unassigned']),
          theme: 'striped',
          headStyles: { fillColor: [39, 174, 96] },
          margin: { left: margin, right: margin },
      });
      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    if (meeting.speakerSummaries.length > 0) {
      autoTable(doc, {
          startY: yPos,
          head: [['Speaker', 'Summary']],
          body: meeting.speakerSummaries.map(s => [s.speaker, s.summary]),
          theme: 'grid',
          headStyles: { fillColor: [142, 68, 173] },
          margin: { left: margin, right: margin },
      });
    }

    doc.save(`${meeting.title.replace(/[^a-zA-Z0-9]/g, '_')}_summary.pdf`);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-slate-200 pb-6 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{meeting.title}</h2>
          <p className="text-md text-slate-500 mt-1">{new Date(meeting.date).toDateString()}</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0 flex-wrap">
             <button onClick={onBack} className="flex items-center px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                <ArrowLeftIcon />
                Back
            </button>
            <button onClick={handleExportPDF} className="flex items-center px-4 py-2 text-sm font-semibold text-sky-700 bg-sky-100 hover:bg-sky-200 rounded-lg transition-colors">
                <PDFIcon />
                Export PDF
            </button>
            <button onClick={() => onDelete(meeting.id)} className="flex items-center px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors">
                <TrashIcon />
                Delete
            </button>
        </div>
      </div>

      <div className="space-y-10">
        <section>
          <h3 className="text-xl font-semibold text-slate-800 mb-4 border-l-4 border-blue-500 pl-4">Overall Summary</h3>
          <p className="text-slate-700 leading-relaxed bg-slate-50/70 p-5 rounded-lg border border-slate-200">{meeting.overallSummary}</p>
        </section>

        {meeting.actionItems.length > 0 && (
          <section>
            <h3 className="text-xl font-semibold text-slate-800 mb-4 border-l-4 border-green-500 pl-4">Action Items</h3>
            <ul className="space-y-4">
              {meeting.actionItems.map((item, index) => (
                <li key={index} className="flex items-start p-5 bg-slate-50/70 rounded-lg border border-slate-200">
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm mr-4 mt-1 ring-4 ring-green-100">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-slate-800 font-medium">{item.item}</p>
                    {item.assignedTo && item.assignedTo.toLowerCase() !== 'unassigned' && (
                        <span className="text-xs font-semibold bg-green-100 text-green-800 px-2.5 py-1 rounded-full mt-2 inline-block">
                        Assigned to: {item.assignedTo}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {meeting.speakerSummaries.length > 0 && (
          <section>
            <h3 className="text-xl font-semibold text-slate-800 mb-4 border-l-4 border-purple-500 pl-4">Speaker Summaries</h3>
            <div className="space-y-4">
              {meeting.speakerSummaries.map((speaker, index) => (
                <div key={index} className="bg-slate-50/70 p-5 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-purple-800 text-lg">{speaker.speaker}</h4>
                  <p className="mt-2 text-slate-700 leading-relaxed">{speaker.summary}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
             <details className="group bg-slate-50/70 rounded-lg border border-slate-200">
                <summary className="cursor-pointer text-xl font-semibold text-slate-800 list-none flex justify-between items-center p-5">
                    <div className="flex items-center">
                      <span className="border-l-4 border-slate-400 pl-4">Full Transcript</span>
                    </div>
                    <div className="flex items-center">
                      <button onClick={handleCopy} className={`mr-4 p-2 rounded-full transition-colors ${isCopied ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
                          {isCopied ? <CheckIcon /> : <ClipboardIcon />}
                      </button>
                      <svg className="h-6 w-6 text-slate-500 group-open:rotate-90 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                </summary>
                <div className="px-5 pb-5">
                    <div className="bg-slate-200/50 p-4 rounded-md max-h-96 overflow-y-auto">
                        <p className="text-slate-600 whitespace-pre-wrap font-mono text-sm leading-relaxed">{meeting.transcript}</p>
                    </div>
                </div>
            </details>
        </section>
      </div>
    </div>
  );
};

export default MeetingDetails;
