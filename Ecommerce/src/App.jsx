import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/Home';
// import AboutPage from './pages/AboutPage';
// ...other imports

import Sidebar from './components/Sidebar';
import Settings from './pages/SettingsPage';

function App() {
  const [theme, setTheme] = useState('dark');
  const [sidebarMode, setSidebarMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <Router>
      <div className="app-container">
        <Sidebar onShowSettings={() => setShowSettings(true)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* ...other routes */}
          </Routes>
        </main>
        {showSettings && (
          <Settings
            theme={theme}
            setTheme={setTheme}
            sidebarMode={sidebarMode}
            setSidebarMode={setSidebarMode}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
