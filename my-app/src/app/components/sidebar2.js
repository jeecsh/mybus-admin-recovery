"use client";

import DashboardIcon from "@mui/icons-material/Dashboard";
import DirectionsBusOutlinedIcon from '@mui/icons-material/DirectionsBusOutlined';
import NaturePeopleOutlinedIcon from '@mui/icons-material/NaturePeopleOutlined';
import NotificationAddOutlinedIcon from '@mui/icons-material/NotificationAddOutlined';
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import ReportOutlinedIcon from '@mui/icons-material/ReportOutlined';
import SettingsSuggestOutlinedIcon from '@mui/icons-material/SettingsSuggestOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import MenuIcon from '@mui/icons-material/Menu'; // Import Menu icon
import styles from './sidebar2.module.css'; // Import CSS module
import Link from 'next/link';

const Sidebar2 = ({ isOpen, toggleSidebar }) => {
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
          <li>
            <Link href="/" legacyBehavior>
              <a className={styles.link}>
                <DashboardIcon className={styles.icon} />
                <span>Dashboard</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/addRoute" legacyBehavior>
              <a className={styles.link}>
                <DirectionsBusOutlinedIcon className={styles.icon} />
                <span>add bus</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/stations" legacyBehavior>
              <a className={styles.link}>
                <NaturePeopleOutlinedIcon className={styles.icon} />
                <span>add stations</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/notification" legacyBehavior>
              <a className={styles.link}>
                <NotificationAddOutlinedIcon className={styles.icon} />
                <span>add notifications</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/history" legacyBehavior>
              <a className={styles.link}>
                <PsychologyOutlinedIcon className={styles.icon} />
                <span>logs</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/feedback" legacyBehavior>
              <a className={styles.link}>
                <ReportOutlinedIcon className={styles.icon} />
                <span>issues</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/system" legacyBehavior>
              <a className={styles.link}>
                <SettingsSuggestOutlinedIcon className={styles.icon} />
                <span>system health</span>
              </a>
            </Link>
          </li>
          <li>
          
          </li>
        </ul>
      </div>

    
    </div>
  );
};

export default Sidebar2;