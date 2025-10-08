import React from 'react';

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 9h-2v4h2v-4zm-2-2h2V5h-2v4z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
  </svg>
);


const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center">
        <DocumentIcon />
        <h1 className="ml-3 text-2xl font-bold text-slate-800 tracking-tight">
          MoM AI Assistant
        </h1>
      </div>
    </header>
  );
};

export default Header;