const Attendance = require("../models/Attendance");
const Timetable = require("../models/Timetable");

// Create Attendance (with dynamic timetable mapping)
const markAttendance = async (req, res) => {
    try {
        const {
            semesterId,
            branch,
            section,
            studentId,
            attendanceDate,
            subject,
            status,
        } = req.body;

        // 1. Find the active timetable version for the specific class and date
        const timetable = await Timetable.findOne({
            semesterId,
            branch,
            section,
            effectiveFrom: { $lte: new Date(attendanceDate) },
            effectiveTo: { $gte: new Date(attendanceDate) }
        }).sort({ effectiveFrom: -1 });

        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: "No timetable found for this section on the selected date",
            });
        }

        // 2. Create the attendance record
        const attendance = await Attendance.create({
            studentId,
            attendanceDate,
            timetableId: timetable._id,
            subject,
            status,
            branch,
            section
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

// Get Attendance Report (for Admin/Faculty)
const getAttendanceReport = async (req, res) => {
    try {
        const { semesterId, branch, section, startDate, endDate } = req.query;

        const report = await Attendance.find({
            semesterId,
            branch,
            section,
            attendanceDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).populate("timetableId");

        res.status(200).json({
            success: true,
            data: report,
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
    getAttendanceReport,
    getAttendance,
};