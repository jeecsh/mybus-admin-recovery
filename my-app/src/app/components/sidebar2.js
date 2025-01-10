"use client";

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'; // Icon for scroll-to-top
import SettingsIcon from '@mui/icons-material/Settings'; // Example for the second icon
import MenuIcon from '@mui/icons-material/Menu'; // Import Menu icon
import styles from './sidebar2.module.css'; // Import CSS module
import Link from 'next/link';

const Sidebar2 = ({ isOpen, toggleSidebar }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); // Scroll to the top of the page
  };

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.top}>
        {/* Menu button to toggle sidebar visibility */}
        <button onClick={toggleSidebar} className={styles.menuButton}>
          <MenuIcon />
        </button>
      </div>

      <div className={styles.center}>
        <ul>
          {/* Back to top icon */}
          <li onClick={scrollToTop} className={styles.link}>
            <ArrowUpwardIcon className={styles.icon} />
          </li>

          {/* Second icon */}
          <li className={styles.link}>
            <SettingsIcon className={styles.icon} />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar2;
