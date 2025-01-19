'use client';

import { useState, useEffect } from 'react';
import styles from './settings.module.css';
import { NotificationsActive, Warning, History } from '@mui/icons-material';
import Sidebar from '../components/sidebar';
import Navbar from '../components/navbar';
import Popup from '../components/pop'; // Import the Popup component

function Settings() {
  const [settings, setSettings] = useState({
    tempLimitReboot: false,
    voltageLimitReboot: false,
    notificationsEnabled: false,
    emergencyAlertsEnabled: false,
    action: 'notify',
    logRetention: '30',
    tempMax: 85,
    voltageMax: 5
  });

  const [tempSettings, setTempSettings] = useState({ ...settings });
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setTempSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleToggle = (key) => {
    setTempSettings(prevSettings => ({
      ...prevSettings,
      [key]: !prevSettings[key]
    }));
  };

  const handleActionChange = (event) => {
    setTempSettings(prevSettings => ({
      ...prevSettings,
      action: event.target.value
    }));
  };

  const handleLogRetentionChange = (event) => {
    setTempSettings(prevSettings => ({
      ...prevSettings,
      logRetention: event.target.value
    }));
  };

  const handleMaxValueChange = (key, value) => {
    setTempSettings(prevSettings => ({
      ...prevSettings,
      [key]: Number(value)
    }));
  };

  const saveSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tempSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSettings(tempSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.content}>
        <Navbar />
        <header className={styles.header}>
          <h1>System Settings</h1>
          <p>System Configuration and Monitoring</p>
        </header>

        <div className={styles.grid}>
          <div className={styles.thresholdGroup}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <Warning className={styles.iconWarning} />
                <h2>Threshold Controls</h2>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.settingRow}>
                  <label htmlFor="tempLimit">Temperature Limit exceeding</label>
                  <label className={styles.switch}>
                    <input
                      id="tempLimit"
                      type="checkbox"
                      checked={tempSettings.tempLimitReboot}
                      onChange={() => handleToggle('tempLimitReboot')}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <div className={styles.settingRow}>
                  <label htmlFor="tempMax">Max Temperature (°C)</label>
                  <input
                    id="tempMax"
                    type="number"
                    className={styles.numberInput}
                    value={tempSettings.tempMax}
                    onChange={(e) => handleMaxValueChange('tempMax', e.target.value)}
                  />
                </div>

                <div className={styles.settingRow}>
                  <label htmlFor="voltageLimit">Voltage Limit exceeding</label>
                  <label className={styles.switch}>
                    <input
                      id="voltageLimit"
                      type="checkbox"
                      checked={tempSettings.voltageLimitReboot}
                      onChange={() => handleToggle('voltageLimitReboot')}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <div className={styles.settingRow}>
                  <label htmlFor="voltageMax">Max Voltage (V)</label>
                  <input
                    id="voltageMax"
                    type="number"
                    className={styles.numberInput}
                    value={tempSettings.voltageMax}
                    onChange={(e) => handleMaxValueChange('voltageMax', e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <Warning className={styles.iconAction} />
                <h2>Threshold Action</h2>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.radioGroup}>
                  {[
                    { value: 'notify', label: 'Notify User Only' },
                    { value: 'reboot', label: 'Reboot Only' },
                    { value: 'shutdown', label: 'Shutdown Only' },
                    { value: 'reboot-then-shutdown', label: 'Reboot Twice, Then Shutdown' },
                  ].map((option) => (
                    <label key={option.value} className={styles.radio}>
                      <input
                        type="radio"
                        name="action"
                        value={option.value}
                        checked={tempSettings.action === option.value}
                        onChange={handleActionChange}
                      />
                      <span className={styles.radioLabel}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <NotificationsActive className={styles.iconNotification} />
              <h2>Notifications</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.settingRow}>
                <label htmlFor="notifications">Enable Notifications</label>
                <label className={styles.switch}>
                  <input
                    id="notifications"
                    type="checkbox"
                    checked={tempSettings.notificationsEnabled}
                    onChange={() => handleToggle('notificationsEnabled')}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
              <div className={styles.settingRow}>
                <label htmlFor="emergency">Emergency Alerts</label>
                <label className={styles.switch}>
                  <input
                    id="emergency"
                    type="checkbox"
                    checked={tempSettings.emergencyAlertsEnabled}
                    onChange={() => handleToggle('emergencyAlertsEnabled')}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <History className={styles.iconHistory} />
              <h2>Log Retention</h2>
            </div>
            <div className={styles.cardBody}>
              <select
                className={styles.select}
                value={tempSettings.logRetention}
                onChange={handleLogRetentionChange}
              >
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>
          </section>

          {/* Button inside the grid */}
          <div className={styles.buttonContainer}>
            <button className={styles.updateButton} onClick={() => setIsPopupVisible(true)}>
              Update Settings
            </button>
          </div>
        </div>

        {/* Popup for Confirmation */}
        {isPopupVisible && (
          <Popup
            title="Confirm Update"
            message="Are you sure you want to update the settings?"
            onClose={() => setIsPopupVisible(false)}
            onConfirm={() => {
              saveSettings();
              setIsPopupVisible(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Settings;