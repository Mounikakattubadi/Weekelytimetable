const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

const semesterRoutes = require("./routes/semesterRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const Semester = require("./models/Semester");
const Timetable = require("./models/Timetable");
const Attendance = require("./models/Attendance");

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/semesters", semesterRoutes);
app.use("/api/timetables", timetableRoutes);
app.use("/api/attendance", attendanceRoutes);
// Home Route
app.get("/", (req, res) => {
  res.send("API Running...");
});

// Test Create Semester
app.get("/test/create-semester", async (req, res) => {
  try {
    const semester = await Semester.create({
      name: "Semester 1",
      startDate: "2026-07-01",
      endDate: "2026-12-31",
    });

    res.json(semester);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Test Create Timetable
app.get("/test/create-timetable", async (req, res) => {
  try {
    const semester = await Semester.findOne();

    if (!semester) {
      return res.json({ message: "Create a semester first." });
    }

    const timetable = await Timetable.create({
      semesterId: semester._id,
      effectiveFrom: new Date("2026-07-14"),
      schedule: [
        {
          day: "Monday",
          periods: [
            {
              period: 1,
              subject: "Math",
              faculty: "Dr. Smith",
            },
            {
              period: 2,
              subject: "Physics",
              faculty: "Dr. John",
            },
          ],
        },
      ],
    });

    res.json(timetable);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Test Mark Attendance
app.get("/test/mark-attendance", async (req, res) => {
  try {
    const semester = await Semester.findOne();

    const timetable = await Timetable.findOne({
      semesterId: semester._id,
      effectiveFrom: { $lte: new Date("2026-07-16") },
    }).sort({ effectiveFrom: -1 });

    if (!timetable) {
      return res.status(404).json({
        message: "No timetable found",
      });
    }

    const attendance = await Attendance.create({
      studentId: "STU001",
      attendanceDate: new Date("2026-07-16"),
      timetableId: timetable._id,
      subject: "Math",
      status: "Present",
    });

    res.json({
      timetableUsed: timetable.effectiveFrom,
      attendance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});