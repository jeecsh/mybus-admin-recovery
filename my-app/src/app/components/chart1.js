"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, ButtonGroup, Menu, MenuItem } from '@mui/material';
import { LineChart, BarChart } from '@mui/x-charts';
import styles from './chart1.module.css'; // Your CSS module

// Mock data generation
const generateMockPassengerData = (week) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days.map((day) => ({
    date: day,
    count: Math.floor(Math.random() * 100) + 20, // Random data for demo purposes
  }));
};

const generateMockRoutePopularity = (month) => {
  const routes = ['Route 1', 'Route 2', 'Route 3', 'Route 4'];
  return routes.map((route) => ({
    name: route,
    count: Math.floor(Math.random() * 300) + 50, // Random data for demo purposes
  }));
};

export default function HeroSection() {
  // Separate states for each chart's selected filters
  const [passengerData, setPassengerData] = useState([]);
  const [routePopularity, setRoutePopularity] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState("Last Week");
  const [selectedMonth, setSelectedMonth] = useState("Last Month");

  // Menu anchor states for Passenger Count (Week) and Route Popularity (Month)
  const [weekMenuAnchor, setWeekMenuAnchor] = useState(null);
  const [monthMenuAnchor, setMonthMenuAnchor] = useState(null);

  // Load data for Passenger Count chart when `selectedWeek` changes
  useEffect(() => {
    setPassengerData(generateMockPassengerData(selectedWeek));
  }, [selectedWeek]);

  // Load data for Route Popularity chart when `selectedMonth` changes
  useEffect(() => {
    setRoutePopularity(generateMockRoutePopularity(selectedMonth));
  }, [selectedMonth]);

  const handleWeekMenuOpen = (event) => {
    setWeekMenuAnchor(event.currentTarget);
  };

  const handleWeekMenuClose = (week) => {
    if (week) setSelectedWeek(week);
    setWeekMenuAnchor(null);
  };

  const handleMonthMenuOpen = (event) => {
    setMonthMenuAnchor(event.currentTarget);
  };

  const handleMonthMenuClose = (month) => {
    if (month) setSelectedMonth(month);
    setMonthMenuAnchor(null);
  };

  return (
    <Box className={styles.heroSection}>
      <Typography variant="h4" className={styles.h1}>
      </Typography>
      
      <Box className={styles.chartContainer}>
        {/* Passenger Count Over the Week */}
        <Box className={styles.lineChart}>
          <Typography variant="h6" gutterBottom>{`Passenger Count - ${selectedWeek}`}</Typography>
          <ButtonGroup variant="outlined" color="primary" sx={{ marginBottom: '10px' }}>
            <Button onClick={() => setSelectedWeek("Last Week")}>Last Week</Button>
            <Button onClick={handleWeekMenuOpen}>Previous Weeks</Button>
          </ButtonGroup>
          <Menu anchorEl={weekMenuAnchor} open={Boolean(weekMenuAnchor)} onClose={() => handleWeekMenuClose(null)}>
            <MenuItem onClick={() => handleWeekMenuClose("Week of Sep 1-7")}>Week of Sep 1-7</MenuItem>
            <MenuItem onClick={() => handleWeekMenuClose("Week of Aug 1-7")}>Week of Aug 1-7</MenuItem>
            <MenuItem onClick={() => handleWeekMenuClose("Week of Jul 1-7")}>Week of Jul 1-7</MenuItem>
          </Menu>
          <LineChart
            width={500}
            height={300}
            series={[
              {
                data: passengerData.map((entry) => entry.count),
                label: 'Passengers',
                color: '#ffcc00',
              },
            ]}
            xAxis={[
              {
                data: passengerData.map((entry) => entry.date),
                scaleType: 'band',
              },
            ]}
          />
        </Box>
        
        {/* Bus Route Popularity */}
        <Box className={styles.barChart}>
          <Typography variant="h6" gutterBottom>{`Bus Route Popularity - ${selectedMonth}`}</Typography>
          <ButtonGroup variant="outlined" color="primary" sx={{ marginBottom: '10px' }}>
            <Button onClick={() => setSelectedMonth("Last Month")}>Last Month</Button>
            <Button onClick={handleMonthMenuOpen}>Previous Months</Button>
          </ButtonGroup>
          <Menu anchorEl={monthMenuAnchor} open={Boolean(monthMenuAnchor)} onClose={() => handleMonthMenuClose(null)}>
            <MenuItem onClick={() => handleMonthMenuClose("September")}>September</MenuItem>
            <MenuItem onClick={() => handleMonthMenuClose("August")}>August</MenuItem>
            <MenuItem onClick={() => handleMonthMenuClose("July")}>July</MenuItem>
            <MenuItem onClick={() => handleMonthMenuClose("June")}>June</MenuItem>
            <MenuItem onClick={() => handleMonthMenuClose("May")}>May</MenuItem>
            <MenuItem onClick={() => handleMonthMenuClose("April")}>April</MenuItem>
          </Menu>
          <BarChart
            width={500}
            height={300}
            series={[
              {
                data: routePopularity.map((route) => route.count),
                label: 'Passenger Count',
                color: '#1e3a8a',
              },
            ]}
            xAxis={[
              {
                data: routePopularity.map((route) => route.name),
                scaleType: 'band',
              },
            ]}
          />
        </Box>
      </Box>
    </Box>
  );
}
