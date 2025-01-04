"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import Sidebar2 from "./components/sidebar2"; // New sidebar component
import RoutesOverview from "./components/routes";
import styles from "./page.module.css";
import StationsTable from "./components/tabel";
import AnalysisMode from "./components/analysismode";
import BusDataListener from "./components/busdatalistener";
import Loading from "./components/loading"; // Import your Loading component

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAnalysisActive, setIsAnalysisActive] = useState(false); // Track if the AnalysisMode is active
  const [loading, setLoading] = useState(true); // New loading state
  const analysisRef = useRef(null); // Ref for the AnalysisMode section

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  // Simulate loading state (could be based on data fetching or any other condition)
  useEffect(() => {
    setTimeout(() => {
      setLoading(false); // Stop loading after 2 seconds (you can replace this with your own logic)
    }, 2000);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!analysisRef.current) return;
  
      const analysisPosition = analysisRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
  
      // Check if the top of the analysis section is in the middle of the viewport
      if (analysisPosition.top < viewportHeight / 2 && analysisPosition.top > 0) {
        setIsAnalysisActive(true);
  
        // Automatically scroll a bit further below the analysis section
        window.scrollTo({
          top: window.scrollY + analysisPosition.top + 100, // Scroll an additional 100px
          behavior: "smooth",
        });
      } else {
        setIsAnalysisActive(false);
      }
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      const analysisPosition = analysisRef.current?.getBoundingClientRect();
      if (analysisPosition) {
        if (analysisPosition.top < window.innerHeight / 2) {
          setIsAnalysisActive(true);
        } else {
          setIsAnalysisActive(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={styles.container}>
      {/* Show Loading screen if page is loading */}
      {loading ? (
        <Loading />
      ) : (
        <>
          <BusDataListener />
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
        </>
      )}
    </div>
  );
}
