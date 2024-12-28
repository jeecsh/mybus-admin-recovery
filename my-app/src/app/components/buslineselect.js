"use client"

import { useState } from 'react';
import styles from '../stations/addStationPage.module.css';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

export default function BusLineSelector({ busLines, selectedBusLines, setSelectedBusLines }) {
  const [selectedLine, setSelectedLine] = useState('');

  const handleAddLine = () => {
    const lineId = parseInt(selectedLine, 10);
    if (lineId && !selectedBusLines.includes(lineId)) {
      setSelectedBusLines([...selectedBusLines, lineId]);
    }
    setSelectedLine('');
  };

  const handleRemoveLine = (line) => {
    setSelectedBusLines(selectedBusLines.filter((l) => l !== line));
  };

  return (
    <div>
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { m: 1, width: '25ch' },
        }}
        noValidate
        autoComplete="off"
      >
        <div>
          <TextField
            id="outlined-select-busline"
            select
            label="Select a bus line"
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
            helperText="Please select a bus line"
            variant="outlined"
          >
            {busLines.map((line) => (
              <MenuItem key={line.id} value={line.id}>
                {line.name}
              </MenuItem>
            ))}
          </TextField>
          <button type="button" onClick={handleAddLine} className={styles.button}>
            Add Line
          </button>
        </div>
        <ul className={styles.ul}>
          {selectedBusLines.map((line) => (
            <li key={line} className={styles.li}>
              {busLines.find((l) => l.id === line)?.name}
              <button
                type="button"
                onClick={() => handleRemoveLine(line)}
                className={styles.removeButton}
              >
                X
              </button>
            </li>
          ))}
        </ul>
      </Box>
    </div>
  );
}