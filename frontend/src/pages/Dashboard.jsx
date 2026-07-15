import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="container mt-5">

      <h1>Weekly Timetable Management</h1>

      <div className="mt-4">

        <Link
          to="/semester"
          className="btn btn-primary me-3"
        >
          Semester
        </Link>

        <Link
          to="/timetable"
          className="btn btn-success me-3"
        >
          Timetable
        </Link>

        <Link
          to="/attendance"
          className="btn btn-warning"
        >
          Attendance
        </Link>

      </div>

    </div>
  );
}