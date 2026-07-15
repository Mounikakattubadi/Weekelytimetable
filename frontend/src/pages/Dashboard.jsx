import { Link } from "react-router-dom";
import styles from "./Dashboard.module.css"; // Import the module

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Weekly Timetable Management</h1>

      <div className={styles.linkContainer}>
        <Link to="/semester" className={`${styles.navLink} ${styles.semester}`}>
          Semester
        </Link>

        <Link to="/timetable" className={`${styles.navLink} ${styles.timetable}`}>
          Timetable
        </Link>

        <Link to="/attendance" className={`${styles.navLink} ${styles.attendance}`}>
          Attendance
        </Link>
      </div>
    </div>
  );
}