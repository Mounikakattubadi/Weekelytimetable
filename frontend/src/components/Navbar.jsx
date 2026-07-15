import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">

        <Link className="navbar-brand" to="/">
          Weekly Timetable
        </Link>

        <div className="navbar-nav">
          <Link className="nav-link" to="/">
            Dashboard
          </Link>

          <Link className="nav-link" to="/semester">
            Semester
          </Link>

          <Link className="nav-link" to="/timetable">
            Timetable
          </Link>

          <Link className="nav-link" to="/attendance">
            Attendance
          </Link>
        </div>

      </div>
    </nav>
  );
}