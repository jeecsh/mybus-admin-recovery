import styles from "./nav.module.css";
import Image from 'next/image'; 
import { useState } from "react"; 
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; 

const Navbar = () => {
  const [showError, setShowError] = useState(false);

  const toggleErrorDropdown = () => {
    setShowError(!showError);
  };

  return (
    <div className={styles.navbar}>
      <div className={styles.wrapper}>
        <div className={styles.top}>
          <Image src="/BUSS3.png" alt="mybus Admin" width={100} height={100} className={styles.logo} priority /> 
        </div>
        <div className={styles.item1}>
          ADMIN PANEL
        </div>
        <div className={styles.items}>
          <h2 className={styles.tittle}>
            Track your Future
          </h2>
          {/* Error Icon */}
          <div className={styles.item}>
            <ErrorOutlineIcon 
              onClick={toggleErrorDropdown} 
              className={styles.errorIcon} 
            />
            {showError && (
              <div className={styles.errorDropdown}>
                <div className={styles.errorItem}>Temperature exceded the limit! save mode enabled , PI REBOOTED</div>
                <div className={styles.errorItem}> Temperature exceded the limit! save mode enabled , PI REBOOTED</div>
                <div className={styles.errorItem}></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
