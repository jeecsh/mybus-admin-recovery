import React from 'react';
import { DotLoader } from 'react-spinners';
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import styles from './loading.module.css'; // Custom CSS file for the loader

const Loading = () => {
  return (
    <div className={styles.pageContainer}>
      {/* Navbar at the top */}
      <Navbar />

      <div className={styles.mainContainer}>
        {/* Sidebar on the left */}
        <Sidebar />

        {/* Loader centered in the main content area */}
        <div className={styles.loaderContainer}>
          <DotLoader color="#032975" size={100} />
        </div>
      </div>
    </div>
  );
};

export default Loading;
