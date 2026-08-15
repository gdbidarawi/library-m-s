import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(document.documentElement.getAttribute('data-theme') === 'dark');
  const [language, setLanguage] = useState(localStorage.getItem('lms_lang') || 'en');

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('lms_theme', next ? 'dark' : 'light');
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    localStorage.setItem('lms_lang', e.target.value);
    toast.info('Language preference saved (UI translation can be wired up with i18next)');
  };

  const handleBackup = () => {
    toast.info('Backup triggered — in production this calls a backend endpoint (e.g. mongodump) and returns a downloadable archive.');
  };

  const handleRestore = () => {
    toast.info('Restore triggered — in production this uploads a backup archive to a protected admin-only endpoint.');
  };

  return (
    <div>
      <h2>Settings</h2>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Appearance</h3>
        <div className="flex-between" style={{ maxWidth: 400 }}>
          <span>Dark Mode</span>
          <button className={`btn btn-sm ${darkMode ? 'btn-primary' : 'btn-outline'}`} onClick={toggleDarkMode}>
            {darkMode ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Language</h3>
        <select className="form-control" style={{ maxWidth: 240 }} value={language} onChange={handleLanguageChange}>
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="es">Spanish</option>
          <option value="am">Amharic</option>
        </select>
      </div>

      {user.role === 'admin' && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Database Backup &amp; Restore</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline btn-sm" onClick={handleBackup}>Backup Database</button>
            <button className="btn btn-outline btn-sm" onClick={handleRestore}>Restore Database</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
