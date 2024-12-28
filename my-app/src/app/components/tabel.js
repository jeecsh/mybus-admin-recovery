import React, { useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography } from '@mui/material';
import styles from './tabel.module.css'; // CSS Modules styling

const StationsTable = () => {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('/api/getStation'); // Use the Next.js API route
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStations(data);
      } catch (error) {
        console.error('Error fetching stations:', error);
      }
    };

    fetchStations();
  }, []);

  const handleEdit = (stationId) => {
    console.log(`Edit station: ${stationId}`);
    // Logic for editing station
  };

  const handleDelete = (stationId) => {
    console.log(`Delete station: ${stationId}`);
    // Logic for deleting station
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Typography variant="h6" className={styles.title}>Stations List</Typography>
      </div>
      <TableContainer component={Paper} className={styles.tableContainer}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell className={styles.headerCell}>#</TableCell>
              <TableCell className={styles.headerCell}>Name</TableCell>
              <TableCell className={styles.headerCell}>ID</TableCell>
              <TableCell className={styles.headerCell}>Lines</TableCell>
              <TableCell className={styles.headerCell}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stations.map((station, index) => (
              <TableRow key={station.id} className={styles.row}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{station.name}</TableCell>
                <TableCell>{station.id}</TableCell>
                <TableCell>{station.lines.join(', ')}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(station.id)} className={styles.actionButton}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(station.id)} className={styles.actionButton}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default StationsTable;
