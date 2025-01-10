import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import FullscreenExitOutlinedIcon from "@mui/icons-material/FullscreenExitOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SegmentOutlinedIcon from "@mui/icons-material/SegmentOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import styles from "./nav.module.css";
import Image from 'next/image'; 
import Link from 'next/link'; // Import Next.js Link component

const Navbar = () => {
  return (
    <div className={styles.navbar}>
      <div className={styles.wrapper}>
        <div className={styles.top}>
          <Image src="/BUSS3.png" alt="mybus Admin" width={100} height={100} className={styles.logo} priority /> 
          {/* Adjust width and height as needed */}
        </div>
        <div className={styles.item1}>
          ADMIN PANEL
        </div>
        <div className={styles.items}>
         
       <h2 className={styles.tittle}>
        Track your Future
        </h2>
r        </div>
      </div>
    </div>
  );
};

export default Navbar;
