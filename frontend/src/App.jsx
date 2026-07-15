import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Semester from "./pages/Semester";
import Timetable from "./pages/Timetable";
import Attendance from "./pages/Attendance";

function App() {
  return (
    <BrowserRouter>
          <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/semester" element={<Semester />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/attendance" element={<Attendance />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;