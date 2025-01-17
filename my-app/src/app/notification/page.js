"use client";
import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import {
  NotificationsOutlined,
  DeleteOutline,
  Close as CloseIcon,
  CalendarToday,
} from "@mui/icons-material";
import Navbar from "../components/navbar"; // Adjust the path as necessary
import Sidebar from "../components/sidebar"; // Adjust the path as necessary
import Popup from "../components/pop"; // Adjust the path as necessary
import styles from "./notificationsPage.module.css";

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [timeFrame, setTimeFrame] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Fetch notifications from the API
  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notification");
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setPopupData({
      title: "Confirm Notification",
      message: `Are you sure you want to send the notification titled "${title}"?`,
      onConfirm: handleConfirm,
      onClose: () => setPopupOpen(false),
    });
    setPopupOpen(true);
  };

  // Handle confirmation of notification submission
  const handleConfirm = async () => {
    try {
      const response = await fetch("/api/notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, timeFrame }),
      });

      if (!response.ok) throw new Error("Failed to send notification");

      // Reset form fields
      setTitle("");
      setMessage("");
      setTimeFrame("");
      setPopupOpen(false);

      // Refresh notifications
      await fetchNotifications();

      // Log the action
      await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          info: `Notification "${title}" has been added.`,
          time: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Handle deletion of a single notification
  const handleDeleteNotification = async (id) => {
    setPopupData({
      title: "Delete Notification",
      message: "Are you sure you want to delete this notification?",
      onConfirm: async () => {
        try {
          await fetch(`/api/notification/${id}`, { method: "DELETE" });
          setNotifications(notifications.filter((n) => n.id !== id));
          setPopupOpen(false);

          // Log the action
          await fetch("/api/logs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              info: `Notification titled "${title}" has been deleted.`,
              time: new Date().toISOString(),
            }),
          });
        } catch (error) {
          console.error("Error:", error);
        }
      },
      onClose: () => setPopupOpen(false),
    });
    setPopupOpen(true);
  };

  // Handle deletion of all notifications
  const handleDeleteAll = async () => {
    setPopupData({
      title: "Delete All Notifications",
      message: "Are you sure you want to delete all notifications?",
      onConfirm: async () => {
        try {
          await fetch("/api/notification", { method: "DELETE" });
          setNotifications([]);
          setPopupOpen(false);

          // Log the action
          await fetch("/api/logs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              info: `All notifications have been deleted.`,
              time: new Date().toISOString(),
            }),
          });
        } catch (error) {
          console.error("Error:", error);
        }
      },
      onClose: () => setPopupOpen(false),
    });
    setPopupOpen(true);
  };

  // Toggle sidebar visibility
  const handleSidebarToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar onToggleSidebar={handleSidebarToggle} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarToggle} />
      <Container
        maxWidth="xl"
        className={isSidebarOpen ? styles.shiftedContent : ""}
      >
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <NotificationsOutlined className={styles.headerIcon} />
            <Typography variant="h4">Notifications</Typography>
          </div>
          {notifications.length > 0 && (
            <Button
              variant="outlined"
              className={styles.clearAllButton}
              startIcon={<DeleteOutline />}
              onClick={handleDeleteAll}
            >
              Clear All
            </Button>
          )}
        </div>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <div className={styles.formCard}>
              <h2 className={styles.cardTitle}>Create New Notification</h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <TextField
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                    required
                    className={styles.textField}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <TextField
                    label="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    multiline
                    rows={4}
                    fullWidth
                    required
                    className={styles.textField}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <TextField
                    label="Schedule"
                    type="datetime-local"
                    value={timeFrame}
                    onChange={(e) => setTimeFrame(e.target.value)}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    className={styles.textField}
                    InputProps={{
                      startAdornment: (
                        <CalendarToday className={styles.calendarIcon} />
                      ),
                    }}
                  />
                </div>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  className={styles.submitButton}
                >
                  Send Notification
                </Button>
              </form>
            </div>
          </Grid>

          <Grid item xs={12} md={6}>
            <div className={styles.notificationsCard}>
              <h2 className={styles.cardTitle}>Recent Notifications</h2>
              {notifications.length === 0 ? (
                <div className={styles.emptyState}>No notifications yet</div>
              ) : (
                <div className={styles.notificationsList}>
                  {notifications.map((notification) => {
                    const notificationDate = new Date(
                      notification.time._seconds * 1000
                    ); // Convert _seconds to milliseconds
                    return (
                      <div
                        key={notification.id}
                        className={styles.notificationItem}
                      >
                        <button
                          onClick={() =>
                            handleDeleteNotification(notification.id)
                          }
                          className={styles.deleteButton}
                        >
                          <CloseIcon />
                        </button>
                        <h3 className={styles.notificationTitle}>
                          {notification.title}
                        </h3>
                        <p className={styles.notificationMessage}>
                          {notification.info}
                        </p>
                        <span className={styles.notificationTime}>
                          {notificationDate.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Grid>
        </Grid>

        {/* Render the Popup if it's open */}
        {isPopupOpen && (
          <Popup
            title={popupData.title}
            message={popupData.message}
            onClose={popupData.onClose}
            onConfirm={popupData.onConfirm}
          />
        )}
      </Container>
    </div>
  );
}