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
  const routesOverviewRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  // Simulate loading state (could be based on data fetching or any other condition)
  useEffect(() => {
    setTimeout(() => {
      setLoading(false); // Stop loading after 2 seconds (you can replace this with your own logic)
    }, 2000);
  }, []);

  const scrollToRoutesOverview = () => {
    if (routesOverviewRef.current) {
      routesOverviewRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!analysisRef.current) return;

      const analysisPosition = analysisRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Check if the analysis section is mostly in the viewport
      const threshold = viewportHeight * 0.2; // Adjust this value to control when the sidebar disappears
      if (analysisPosition.top < threshold && analysisPosition.bottom > 0) {
        setIsAnalysisActive(true); // Activate analysis mode when the section is mostly in view
      } else {
        setIsAnalysisActive(false); // Deactivate analysis mode when the section is out of view
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
            <Sidebar2 scrollToRoutesOverview={scrollToRoutesOverview} /> // Show Sidebar2 during analysis
          ) : (
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          )}

          {/* Main Content */}
          <main
            className={`${styles.mainContent} ${
              !isSidebarOpen ? styles.shifted : ""
            } ${isAnalysisActive ? styles.analysisActive : ""}`}
          >
            <div ref={routesOverviewRef}>
              <RoutesOverview />
            </div>

            <div className={styles.tableWrapper}>
              <StationsTable />
            </div>

            <div
              ref={analysisRef}
              className={`${styles.analysisSection} ${
                isAnalysisActive ? styles.analysisBg : ""
              }`}
            >
              <AnalysisMode />
            </div>
          </main>
        </>
      )}
    </div>
  );
}