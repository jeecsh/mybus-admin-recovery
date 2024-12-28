"use client";

import { useState } from 'react';
import Navbar from '../components/navbar'; // Adjust the path as necessary
import Sidebar from '../components/sidebar'; // Adjust the path as necessary
import Popup from '../components/pop'; // Import the Popup component
import styles from './notificationsPage.module.css'; // Importing the CSS module

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [timeFrame, setTimeFrame] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Track sidebar state
  const [isPopupVisible, setPopupVisible] = useState(false); // Track popup visibility
  const [popupData, setPopupData] = useState(null); // Data to display in the popup

  const handleSubmit = async (e) => {
    e.preventDefault();

    const notification = { title, message, timeFrame };

    // Set up the popup data before showing the confirmation popup
    setPopupData({
      title: "Confirm Notification",
      message: `Are you sure you want to send the notification titled "${title}"?`,
      notificationData: notification,
    });
    setPopupVisible(true);
  };

  const handleConfirm = async () => {
    try {
      // Send the notification API request
      const response = await fetch('/api/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(popupData.notificationData),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const data = await response.json();
      console.log('Notification sent successfully:', data);

      // Log the action (send a log API call)
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          info: `Notification titled "${title}" has been added.`,
          time: new Date().toISOString(),
        }),
      });

      // Reset form fields after successful submission
      setTitle('');
      setMessage('');
      setTimeFrame('');
      setPopupVisible(false);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`${styles.content} ${!isSidebarOpen ? styles.shifted : ''}`}>
        <div className={styles.mainContent}>
          <div className={styles.formContainer}>
            <h1 className={styles.pageTitle}>Send Notification</h1>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.label}>Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter notification title"
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>Message</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter notification message"
                  className={styles.textarea}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="timeFrame" className={styles.label}>Time Frame</label>
                <input
                  type="datetime-local"
                  id="timeFrame"
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
              <button type="submit" className={styles.submitButton}>
                Send Notification
              </button>
            </form>
          </div>
        </div>
      </div>
      {isPopupVisible && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          onClose={() => setPopupVisible(false)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
