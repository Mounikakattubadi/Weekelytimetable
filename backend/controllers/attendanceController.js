const Attendance = require("../models/Attendance");
const Timetable = require("../models/Timetable");

// Create Attendance
const markAttendance = async (req, res) => {
  try {
    const {
      semesterId,
      studentId,
      attendanceDate,
      subject,
      status,
    } = req.body;

    const timetable = await Timetable.findOne({
      semesterId,
      effectiveFrom: {
        $lte: new Date(attendanceDate),
      },
    }).sort({
      effectiveFrom: -1,
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "No timetable found for this date",
      });
    }

    const attendance = await Attendance.create({
      studentId,
      attendanceDate,
      timetableId: timetable._id,
      subject,
      status,
    });

    res.status(201).json({
      success: true,
      timetableVersion: timetable.effectiveFrom,
      data: attendance,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Attendance
const getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find().populate("timetableId");

    res.status(200).json({
      success: true,
      data: attendance,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  markAttendance,
  getAttendance,
};