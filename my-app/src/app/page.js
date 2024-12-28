"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import Sidebar2 from "./components/sidebar2"; // New sidebar component
import HeroSection from "./components/chart1";
import RoutesOverview from "./components/routes";
import styles from "./page.module.css";
import StationsTable from "./components/tabel";
import AnalysisMode from "./components/analysismode";
import BusDataListener from "./components/busdatalistener";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAnalysisActive, setIsAnalysisActive] = useState(false); // Track if the AnalysisMode is active
  const analysisRef = useRef(null); // Ref for the AnalysisMode section

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  const handleScroll = () => {
    const analysisPosition = analysisRef.current?.getBoundingClientRect();
    if (analysisPosition) {
      if (analysisPosition.top < window.innerHeight / 2) {
        // If the section is halfway on screen
        setIsAnalysisActive(true);
        analysisRef.current.scrollIntoView({ behavior: "smooth" });
      } else {
        setIsAnalysisActive(false);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={styles.container}>
      <BusDataListener/>
      {/* Navbar */}
      {!isAnalysisActive && (
        <header className={styles.navbar}>
          <Navbar />
        </header>
      )}

      {/* Sidebar */}
      {isAnalysisActive ? (
        <Sidebar2 /> // Show Sidebar2 during analysis
      ) : (
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      )}

      {/* Main Content */}
      <main
        className={`${styles.mainContent} ${
          !isSidebarOpen ? styles.shifted : ""
        } ${isAnalysisActive ? styles.analysisActive : ""}`}
      >
        <RoutesOverview />

        <div className={styles.tableWrapper}>
          <img
            src="mybussvg.svg"
            alt="Station Icon"
            className={styles.iconLeft}
          />
          <StationsTable />
          <HeroSection />
          <div
            ref={analysisRef}
            className={`${styles.analysisSection} ${
              isAnalysisActive ? styles.analysisBg : ""
            }`}
          >
            <AnalysisMode />
          </div>
        </div>
      </main>
    </div>
  );
}
