"use client";
import React, { useState, useEffect, useRef } from "react";
import TroubleshootIcon from "@mui/icons-material/Troubleshoot";
import styles from "./analysis.module.css";
import ChartViewer from "../components/visuals"
import MostCrowdedTimeChart from "../components/crowdedtime"
import HeatMapAndBarChart from "../components/crowdeedstation"
import AccuracyCharts from "../components/estimatedvsactuall"
import PeoplePerTime from "../components/peoplepertime"

const chartCompatibility = {
  routePopularity: ["bar", "pie"],  
  mostCrowdedTime: ["line", "histogram"],
  mostCrowdedStation: ["heatmap", "scatter", "pie"],
  estimatedVsActual: ["scatter", "line"],
  passengerGrowth: ["line"],
  passengerCountPerRouteByTime: ["heatmap", "stackedBar"],
  busDelaysPerRoute: ["bar", "line", "pie"],
  busFrequencyByTime: ["histogram", "line"],
  routeStopsAnalysis: ["bar", "heatmap", "pie"],
  passengerLoadAtStations: ["stackedBar", "heatmap", "pie"],
};

export default function AnalysisMode() {
  const [csvData, setCsvData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [timeFilter, setTimeFilter] = useState({ start: "", end: "" });
  const [charts, setCharts] = useState({}); 
  const [fileNames, setFileNames] = useState([]);
  const [selectedChartTypes, setSelectedChartTypes] = useState({
    bar: false,
    line: false,
    pie: false,
    scatter: false,
    heatmap: false,
    histogram: false,
    stackedBar: false,
  });
  const [selectedDataToVisualize, setSelectedDataToVisualize] = useState({
    routePopularity: false,
    mostCrowdedTime: false,
    mostCrowdedStation: false,
    estimatedVsActual: false,
    passengerGrowth: false,
    passengerCountPerRouteByTime: false,
    // busDelaysPerRoute: false,
    // busFrequencyByTime: false,
    // routeStopsAnalysis: false,
    // passengerLoadAtStations: false,
  });
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchFileList = async () => {
      try {
        const response = await fetch("http://localhost:8000/list-files");
        const data = await response.json();
        setFileNames(data.files);
      } catch (error) {
        console.error("Error fetching file list:", error);
      }
    };

    fetchFileList();
  }, []);

  const handleFileDownload = async (filename) => {
    if (filename) {
      try {
        const response = await fetch(`http://localhost:8000/read-file/${filename}`);
        const data = await response.json();
        setCsvData(data.data);
      } catch (error) {
        console.error("Error fetching file data:", error);
      }
    }
  };

  const handleDateFilterChange = (event) => {
    const { name, value } = event.target;
    setDateFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeFilterChange = (event) => {
    const { name, value } = event.target;
    setTimeFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleChartTypeChange = (event) => {
    const { name, checked } = event.target;
    setSelectedChartTypes((prev) => ({ ...prev, [name]: checked }));
  };

  const handleDataToVisualizeChange = (event) => {
    const { name, checked } = event.target;
    setSelectedDataToVisualize((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSelectAllCharts = () => {
    const availableCharts = getAvailableChartTypes(selectedDataToVisualize);
    const updatedChartTypes = { ...selectedChartTypes };
    availableCharts.forEach((chartType) => {
      updatedChartTypes[chartType] = true;
    });
    setSelectedChartTypes(updatedChartTypes);
  };

  const handleDeselectAllCharts = () => {
    setSelectedChartTypes({
      bar: false,
      line: false,
      pie: false,
      scatter: false,
      heatmap: false,
      histogram: false,
      stackedBar: false,
    });
  };

  const handleSelectAllData = () => {
    setSelectedDataToVisualize({
      routePopularity: true,
      mostCrowdedTime: true,
      mostCrowdedStation: true,
      estimatedVsActual: true,
      passengerGrowth: true,
      passengerCountPerRouteByTime: true,
      // busDelaysPerRoute: true,
      // busFrequencyByTime: true,
      // routeStopsAnalysis: true,
      // passengerLoadAtStations: true,
    });
  };

  const handleDeselectAllData = () => {
    setSelectedDataToVisualize({
      routePopularity: false,
      mostCrowdedTime: false,
      mostCrowdedStation: false,
      estimatedVsActual: false,
      passengerGrowth: false,
      passengerCountPerRouteByTime: false,
      // busDelaysPerRoute: false,
      // busFrequencyByTime: false,
      // routeStopsAnalysis: false,
      // passengerLoadAtStations: false,
    });
  };

  const getAvailableChartTypes = (selectedDataToVisualize) => {
    const selectedDataKeys = Object.keys(selectedDataToVisualize).filter(
      (key) => selectedDataToVisualize[key]
    );

    const availableCharts = selectedDataKeys.reduce((acc, key) => {
      if (chartCompatibility[key]) {
        acc.push(...chartCompatibility[key]);
      }
      return acc;
    }, []);

    return [...new Set(availableCharts)];
  };const handleGenerateData = async () => {
    const payload = {
      file: csvData ? csvData.map((row) => row.join(",")).join("\n") : null,
      dateFilter,
      timeFilter,
      selectedDataToVisualize,
      selectedChartTypes,
    };
  
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await fetch("http://localhost:8000/generate-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error("Failed to generate charts.");
      }
  
      const data = await response.json();
      setCharts(data.charts || {});
    } catch (err) {
      console.error("Error generating data:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

     
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (containerRef.current && entry.isIntersecting) {
          // Add 'visible' class when the container is first in view
          containerRef.current.classList.add(styles.visible);
        }
      },
      { threshold: 0.1 }
    );
  
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
  
    // Clean up observer when component unmounts or ref changes
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);
  
  return (
    <div className={styles.cont}>
      <div className={styles.title}>
        <h1 className={styles.titleText}>Analysis Mode</h1>
        <TroubleshootIcon className={styles.icon} />
      </div>

      <div ref={containerRef} className={styles.container}>
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
          <div className={styles.filterGroup}>
            <label className={styles.datelabel}>
              Start Date:
              <input
                type="date"
                name="start"
                value={dateFilter.start}
                onChange={handleDateFilterChange}
                className={styles.dateInput}
              />
            </label>
            <label className={styles.datelabel}>
              End Date:
              <input
                type="date"
                name="end"
                value={dateFilter.end}
                onChange={handleDateFilterChange}
                className={styles.dateInput}
              />
            </label>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Filter Data by Time</h2>
          <div className={styles.filterGroup}>
            <label className={styles.datelabel}>
              Start Time:
              <input
                type="time"
                name="start"
                value={timeFilter.start}
                onChange={handleTimeFilterChange}
                className={styles.timeInput}
              />
            </label>
            <label className={styles.datelabel}>
              End Time:
              <input
                type="time"
                name="end"
                value={timeFilter.end}
                onChange={handleTimeFilterChange}
                className={styles.timeInput}
              />
            </label>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Choose Data to Visualize</h2>
          <div className={styles.buttonGroup}>
            <button onClick={handleSelectAllData} className={styles.selectAllBtn}>
              Select All Data
            </button>
            <button onClick={handleDeselectAllData} className={styles.selectAllBtn}>
              Deselect All Data
            </button>
          </div>
          <div className={styles.checkboxGroup}>
            {Object.keys(selectedDataToVisualize).map((dataKey) => (
              <label key={dataKey} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name={dataKey}
                  checked={selectedDataToVisualize[dataKey]}
                  onChange={handleDataToVisualizeChange}
                />
                {dataKey
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </label>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Choose Chart Types</h2>
          <div className={styles.buttonGroup}>
            <button onClick={handleSelectAllCharts} className={styles.selectAllBtn}>
              Select All Charts
            </button>
            <button onClick={handleDeselectAllCharts} className={styles.selectAllBtn}>
              Deselect All Charts
            </button>
          </div>
          <div className={styles.checkboxGroup}>
            {Object.keys(selectedChartTypes).map((chartType) => {
              const isDisabled = !getAvailableChartTypes(selectedDataToVisualize).includes(chartType);
              return (
                <label key={chartType} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name={chartType}
                    checked={selectedChartTypes[chartType]}
                    onChange={handleChartTypeChange}
                    disabled={isDisabled}
                  />
                  {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
                </label>
              );
            })}
          </div>
        </section>

        <section className={styles.section}>
  <button
    onClick={handleGenerateData}
    className={styles.generateBtn}
    disabled={isLoading}
  >
    {isLoading ? (
      <div className={styles.buttonContent}>
        <div className={styles.spinner}></div>
        <span>Generating...</span>
      </div>
    ) : (
      "Generate Data"
    )}
  </button>
</section>
      {/* ChartViewer Component */}
      <section className={styles.section}>
        <ChartViewer charts={charts} />
        <MostCrowdedTimeChart charts={charts} />
        <HeatMapAndBarChart charts={charts} />
        <AccuracyCharts charts={charts}/>
        <PeoplePerTime charts={charts}/>
      </section>
      </div>
    </div>
  );
}