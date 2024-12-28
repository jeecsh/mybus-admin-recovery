import React, { useState, useEffect } from 'react';
import styles from './analysis.module.css';

export default function AnalysisMode() {
  const [csvData, setCsvData] = useState(null);
  const [dateFilter, setDateFilter] = useState("");
  const [fileNames, setFileNames] = useState([]);

  useEffect(() => {
    const fetchFileList = async () => {
      const response = await fetch('http://localhost:8000/list-files');
      const data = await response.json();
      setFileNames(data.files);
    };

    fetchFileList();
  }, []);

  const handleFileDownload = async (filename) => {
    const response = await fetch(`http://localhost:8000/read-file/${filename}`);
    const data = await response.json();
    setCsvData(data.data);
  };

  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
  };

  return (
    <div className={styles.cont}>
      <div className={styles.container}>
        <h1 className={styles.header}>Analysis Mode</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Choose a CSV File</h2>
          <select
            onChange={(e) => handleFileDownload(e.target.value)}
            className={styles.fileInput}
          >
            <option value="">Select CSV File</option>
            {fileNames.map((fileName, index) => (
              <option key={index} value={fileName}>
                {fileName}
              </option>
            ))}
          </select>

          {csvData && (
            <div className={styles.preview}>
              <h3>CSV Data Preview:</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {csvData[0].map((col, index) => (
                      <th key={index} className={styles.tableHeader}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(1, 10).map((row, index) => (
                    <tr key={index} className={styles.tableRow}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className={styles.tableCell}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Filter Data by Date</h2>
          <input
            type="date"
            value={dateFilter}
            onChange={handleDateFilterChange}
            className={styles.dateInput}
          />
        </section>

        <section className={styles.outputSection}>
          <h3 className={styles.outputTitle}>
            Visualization or Additional Features Coming Soon!
          </h3>
        </section>
      </div>
    </div>
  );
}
