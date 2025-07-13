import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Settings from './pages/SettingsPage';
import Home from './pages/Home';

function App() {
  const [theme, setTheme] = useState('dark');
  const [sidebarMode, setSidebarMode] = useState(true); // true: sidebar, false: topbar
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <Router>
      <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-neutral-900' : 'bg-white'}`}>
        {/* Sidebar or Topbar */}
        {sidebarMode ? (
          <div className="w-64 min-h-screen flex-shrink-0">
            <Sidebar onShowSettings={() => setShowSettings(true)} />
          </div>
        ) : (
          <Topbar onShowSettings={() => setShowSettings(true)} />
        )}

        {/* Main Content */}
        <div className={`flex-1 min-h-screen overflow-auto ${sidebarMode ? '' : 'pt-16'}`}>
          <main className="px-2 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              {/* Add more routes here */}
            </Routes>
          </main>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <Settings
                theme={theme}
                setTheme={setTheme}
                sidebarMode={sidebarMode}
                setSidebarMode={setSidebarMode}
                onClose={() => setShowSettings(false)}
              />
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
