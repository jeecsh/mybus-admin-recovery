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
          <Link href="/search" className={styles.item}>
            <PublicOutlinedIcon className={styles.icon} />
            English
          </Link>
          <Link href="/dark-mode" className={styles.item}>
            <DarkModeOutlinedIcon className={styles.icon} />
          </Link>
          <Link href="/fullscreen" className={styles.item}>
            <FullscreenExitOutlinedIcon className={styles.icon} />
          </Link>
          <Link href="/feedback " className={styles.item}>
            <ChatBubbleOutlineOutlinedIcon className={styles.icon} />
            <div className={styles.counter}>2</div>
          </Link>
          <Link href="/segment" className={styles.item}>
            <SegmentOutlinedIcon className={styles.icon} />
          </Link>
          <Link href="/profile" className={styles.item}>
            <img src="/BUSS3.png" alt="avatar" className={styles.avatar} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
