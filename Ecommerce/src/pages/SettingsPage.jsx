import React from "react";
import "./Settings.css";

export default function SettingsPage({
  theme,
  setTheme,
  sidebarMode,
  setSidebarMode,
  onClose
}) {
  const [localTheme, setLocalTheme] = React.useState(theme);
  const [localSidebarMode, setLocalSidebarMode] = React.useState(sidebarMode);

  React.useEffect(() => {
    setLocalTheme(theme);
    setLocalSidebarMode(sidebarMode);
  }, [theme, sidebarMode]);

  const handleApply = () => {
    setTheme(localTheme);
    setSidebarMode(localSidebarMode);
    if (onClose) onClose();
  };

  return (
    <div className="settings-backdrop">
      <div className="settings-card">
        <h2 className="settings-title">Settings</h2>
        <div className="settings-group">
          <label>Theme:</label>
          <button
            className={`theme-toggle${localTheme === "dark" ? " selected" : ""}`}
            onClick={() => setLocalTheme(localTheme === "dark" ? "bright" : "dark")}
            aria-label="Toggle theme"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="5" fill={localTheme === "dark" ? "#dc0505" : "#b18c4b"} />
              <g stroke={localTheme === "dark" ? "#dc0505" : "#b18c4b"} strokeWidth="2">
                <line x1="12" y1="2" x2="12" y2="5" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="2" y1="12" x2="5" y2="12" />
                <line x1="19" y1="12" x2="22" y2="12" />
                <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
                <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
                <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
                <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
              </g>
            </svg>
            {localTheme === "dark" ? "Dark" : "Bright"}
          </button>
        </div>
        <div className="settings-group">
          <label>Navigation Layout:</label>
          <button
            className={`layout-toggle${localSidebarMode ? " selected" : ""}`}
            onClick={() => setLocalSidebarMode((m) => !m)}
            aria-label="Toggle navigation layout"
          >
            {localSidebarMode ? "Sidebar" : "Topbar"}
          </button>
        </div>
        <div className="settings-actions">
          <button className="apply-btn" onClick={handleApply}>
            Apply
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
