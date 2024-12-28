"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './feedback.module.css';
import Navbar from '../components/navbar'; // Adjust the path as necessary
import Sidebar from '../components/sidebar'; // Adjust the path as necessary  
import Popup from '../components/pop'; // Import Popup component

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Track sidebar state
  const [isPopupVisible, setPopupVisible] = useState(false); // Track popup visibility
  const [popupData, setPopupData] = useState(null); // Data for popup

  useEffect(() => {
    // Fetch all feedback from the API when the component mounts
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get('/api/feedback');
        setFeedbacks(response.data);
      } catch (error) {
        console.error('Error fetching feedback:', error);
      }
    };

    fetchFeedbacks();
  }, []);

  const deleteFeedback = async (id, feedbackText) => {
    // Set up the popup data before showing the confirmation popup
    setPopupData({
      title: "Confirm Deletion",
      message: `Are you sure you want to delete this feedback?`,
      feedbackId: id,
      feedbackText: feedbackText,
      isAllFeedback: false,
    });
    setPopupVisible(true);
  };

  const deleteAllFeedback = async () => {
    // Set up the popup data for deleting all feedback
    setPopupData({
      title: "Confirm Deletion",
      message: "Are you sure you want to delete all feedback?",
      feedbackId: null,
      feedbackText: null,
      isAllFeedback: true,
    });
    setPopupVisible(true);
  };

  const handleConfirm = async () => {
    try {
      if (popupData.isAllFeedback) {
        // Delete all feedback
        await axios.delete('/api/feedback');
        setFeedbacks([]);  // Clear all feedback in the UI
      } else if (popupData.feedbackId) {
        // Delete individual feedback
        await axios.delete(`/api/feedback/${popupData.feedbackId}`);
        setFeedbacks(feedbacks.filter(feedback => feedback.id !== popupData.feedbackId));
      }

      // Log the action after deletion, using feedback attribute instead of ID
      await axios.post('/api/logs', {
        info: popupData.isAllFeedback
          ? 'All feedback deleted.'
          : `Feedback deleted: ${popupData.feedbackText}`,
        time: new Date().toISOString(),
      });

      // Reset popup state after action is performed
      setPopupVisible(false);
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.mainContent}>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`${styles.content} ${!isSidebarOpen ? styles.shifted : ''}`}>
          <h1 className={styles.h1}>User Feedback</h1>
          <ul className={styles.feedbackList}>
            {feedbacks.length > 0 ? (
              feedbacks.map(feedback => (
                <li key={feedback.id} className={styles.feedbackItem}>
                  <p>{feedback.feedback}</p>
                  <small>{new Date(feedback.timestamp).toLocaleString()}</small>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => deleteFeedback(feedback.id, feedback.feedback)}
                  >
                    Delete
                  </button>
                </li>
              ))
            ) : (
              <p>No feedback available</p>
            )}
          </ul>

          {feedbacks.length > 0 && (
            <button onClick={deleteAllFeedback} className={styles.deleteAllBtn}>
              Delete All Feedback
            </button>
          )}
        </div>
      </div>

      {/* Popup Component */}
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
};

export default FeedbackPage;
