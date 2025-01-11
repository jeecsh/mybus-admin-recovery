// Settings.jsx
'use client';

import { useState } from 'react';
import styles from './settings.module.css';
import { NotificationsActive, Warning, History } from '@mui/icons-material';
import Sidebar from '../components/sidebar';
import Navbar from '../components/navbar';

function Settings() {
  const [settings, setSettings] = useState({
    tempLimitReboot: false,
    voltageLimitReboot: false,
    notificationsEnabled: false,
    emergencyAlertsEnabled: false,
    action: 'notify',
    logRetention: '30',
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleActionChange = (event) => {
    setSettings((prev) => ({ ...prev, action: event.target.value }));
  };

  const handleLogRetentionChange = (event) => {
    setSettings((prev) => ({ ...prev, logRetention: event.target.value }));
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
                  <label htmlFor="tempLimit">Temperature Limit exceding</label>
                  <label className={styles.switch}>
                    <input
                      id="tempLimit"
                      type="checkbox"
                      checked={settings.tempLimitReboot}
                      onChange={() => handleToggle('tempLimitReboot')}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <div className={styles.settingRow}>
                  <label htmlFor="voltageLimit">Voltage Limit exceding</label>
                  <label className={styles.switch}>
                    <input
                      id="voltageLimit"
                      type="checkbox"
                      checked={settings.voltageLimitReboot}
                      onChange={() => handleToggle('voltageLimitReboot')}
                    />
                    <span className={styles.slider}></span>
                  </label>
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
                        checked={settings.action === option.value}
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
                    checked={settings.notificationsEnabled}
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
                    checked={settings.emergencyAlertsEnabled}
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
                value={settings.logRetention}
                onChange={handleLogRetentionChange}
              >
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Settings;