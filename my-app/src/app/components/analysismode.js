import React, { useState } from 'react';
import styles from "./analysis.module.css";

export default function AnalysisMode() {
    const [csvData, setCsvData] = useState(null); // To store the uploaded CSV data
    const [dateFilter, setDateFilter] = useState(""); // To store the date filter value

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type === "text/csv") {
            const reader = new FileReader();
            reader.onload = () => {
                const text = reader.result;
                const rows = text.split("\n").map(row => row.split(","));
                setCsvData(rows);
            };
            reader.readAsText(file);
        } else {
            alert("Please upload a valid CSV file.");
        }
    };

    const handleDateFilterChange = (event) => {
        setDateFilter(event.target.value);
    };

    return (
        <div className={styles.cont}>
              <div className={styles.container}>
            <h1>Analysis Mode</h1>

            {/* Data Upload Section */}
            <section className={styles.uploadSection}>
                <h2>Upload Monthly CSV File</h2>
                <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileUpload} 
                    className={styles.fileInput} 
                />
                {csvData && (
                    <div className={styles.preview}>
                        <h3>First Few Rows of Data:</h3>
                        <table>
                            <thead>
                                <tr>
                                    {csvData[0].map((col, index) => (
                                        <th key={index}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {csvData.slice(1, 6).map((row, index) => (
                                    <tr key={index}>
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex}>{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Date Filter Section */}
            <section className={styles.dateFilterSection}>
                <h2>Filter Data by Date</h2>
                <input
                    type="date"
                    value={dateFilter}
                    onChange={handleDateFilterChange}
                    className={styles.dateInput}
                />
            </section>

            {/* Output Section (Empty for now) */}
            <section className={styles.outputSection}>
                {/* This will be populated with visualizations later */}
            </section>
            </div>
        </div>
    );
}
