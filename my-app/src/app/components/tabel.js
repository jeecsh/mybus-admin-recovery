import React, { useEffect, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  InputAdornment,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from "./tabel.module.css"

const StationsTable = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    lines: []
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const fetchStations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/getStation');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStations(data);
    } catch (error) {
      console.error('Error fetching stations:', error);
      showSnackbar('Error fetching stations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleEdit = (station) => {
    setSelectedStation(station);
    setEditFormData({
      name: station.name || '',
      lines: Array.isArray(station.lines) ? station.lines : []
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      if (!editFormData.name || !editFormData.lines.length) {
        showSnackbar('Please fill in all required fields', 'error');
        return;
      }

      const response = await fetch(`/api/getStation/${selectedStation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editFormData.name.trim(),
          lines: editFormData.lines,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update station');
      }

      showSnackbar('Station updated successfully');
      setEditDialogOpen(false);
      fetchStations();
    } catch (error) {
      console.error('Error updating station:', error);
      showSnackbar(error.message || 'Error updating station', 'error');
    }
  };

  const handleLinesChange = (e) => {
    const linesString = e.target.value;
    const linesArray = linesString
      .split(',')
      .map(line => (typeof line === 'string' ? line.trim() : line))
      .filter(Boolean);

    setEditFormData(prev => ({
      ...prev,
      lines: linesArray
    }));
  };

  const handleDelete = async (stationId) => {
    if (!window.confirm('Are you sure you want to delete this station?')) {
      return;
    }

    try {
      const response = await fetch(`/api/getStation/${stationId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete station');
      }

      showSnackbar('Station deleted successfully');
      fetchStations();
      
    } catch (error) {
      console.error('Error deleting station:', error);
      showSnackbar(error.message || 'Error deleting station', 'error');
    }
    await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        info: `Route titled "${routeName}" with ID "${routeId}" has been added.`,
        time: new Date().toISOString(),
      }),});
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setSelectedStation(null);
    setEditFormData({
      name: '',
      lines: []
    });
  };

  // Filter stations based on search term
  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="150px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1000,
        mx: 'auto',
        p: 4,
        borderRadius: 15,
        bgcolor: '#003976',
        boxShadow: 3,
        mb: 12
      }}
    >
   <Typography
  variant="h4"
  sx={{
    color: 'white',
    mb: 3,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: "Manrope",
    fontSize: 20,
    display: 'flex',  // To align the icon and text horizontally
    alignItems: 'center',  // Center align the icon and text vertically
    justifyContent: 'center', // Center the whole content
    gap: 1, // Adds space between the icon and text
  }}
>
  Stations List
  <PersonPinCircleIcon sx={{ color: '#fbaf32', fontSize: 28 }} />  {/* Station/bus stop icon */}
</Typography>
      {/* Search Input Field */}
  
<TextField
  fullWidth
  className={styles.search}
  variant="outlined"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  sx={{
    mb: 3,
    bgcolor: 'white',
    borderRadius: 20,  // Modern rounded corners
    width: '100%',
    height: 45, // Reduced height for a more compact appearance
    '& .MuiOutlinedInput-root': {
      borderRadius: '20px',  // Smooth rounded corners
      padding: '0 16px', // Horizontal padding
      height: '45px',  // Consistent height
      boxShadow: 'none',  // Remove any shadow on focus
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'transparent',  // Remove border on hover
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'transparent',  // Remove border on focus
      },
    },
    '& .MuiInputLabel-root': {
      color: '#003976',  // Label color
    },
    '& .MuiInputBase-input': {
      paddingLeft: '35px', // Space for the icon
      fontSize: '16px',  // Modern font size
    },
  }}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon sx={{ color: '#003976' }} />
      </InputAdornment>
    ),
  }}
/>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 5,
    overflowY: 'auto',  // Enables scrolling
    maxHeight: '300px',  // Set the max height for the container
    width: '100%',
    marginBottom: "100px",  // Add some space at the bottom
    margin: '0 auto',  // Center the container horizontally
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: '##151462', color: '#003976', fontWeight: 'bold' }}>#</TableCell>
              <TableCell sx={{ backgroundColor: '##151462', color: '#003976', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ backgroundColor: '##151462', color: '#003976', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ backgroundColor: '##151462', color: '#003976', fontWeight: 'bold' }}>Lines</TableCell>
              <TableCell sx={{ backgroundColor: '##151462', color: '#003976', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStations.map((station, index) => (
              <TableRow
                key={station.id}
                sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{station.name}</TableCell>
                <TableCell>{station.id}</TableCell>
                <TableCell>{Array.isArray(station.lines) ? station.lines.join(', ') : ''}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleEdit(station)}
                    sx={{ color: 'gray', '&:hover': { color: '#003976' } }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(station.id)}
                    sx={{ color: 'gray', '&:hover': { color: '#003976' } }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Station</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Station Name"
            fullWidth
            required
            value={editFormData.name}
            onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
            error={!editFormData.name.trim()}
            helperText={!editFormData.name.trim() ? 'Name is required' : ''}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Lines (comma-separated)"
            fullWidth
            required
            value={editFormData.lines.join(', ')}
            onChange={handleLinesChange}
            error={!editFormData.lines.length}
            helperText={!editFormData.lines.length ? 'At least one line is required' : 'Separate lines with commas'}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained"
            disabled={!editFormData.name.trim() || !editFormData.lines.length}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StationsTable;