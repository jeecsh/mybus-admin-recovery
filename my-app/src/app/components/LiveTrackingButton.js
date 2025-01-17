// LiveTrackingButton.js

"use client"
import React, { useState } from 'react';
import { Button, Box, Modal, Typography } from '@mui/material';
import LiveTrackingMap from './LiveTrackingMap'; // Importing the LiveTrackingMap component
import styles from './Livebtn.module.css'; // Importing CSS for modal styling

export default function LiveTrackingButton({ routeId }) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box>
      {/* Live Tracking Button */}
      <Button 
        variant="contained" 
        onClick={handleOpen}
        className={styles.liveTrackingBtn}
      >
        Live Tracking
      </Button>

      {/* Modal to show the Live Tracking Map */}
      <Modal
        open={open}
        onClose={handleClose}
        className={styles.modal}
      >
        <Box className={styles.modalContent}>
          <Typography variant="h6" className={styles.modalTitle}>
            Live Bus Tracking - Route {routeId}
          </Typography>
          
          {/* LiveTrackingMap component */}
          <LiveTrackingMap routeId={routeId} />
        </Box>
      </Modal>
    </Box>
  );
}
