const Attendance = require("../models/Attendance");
const Timetable = require("../models/Timetable");
const Semester = require("../models/Semester");

// 1. Mark Attendance
const markAttendance = async (req, res) => {
    try {
        const { semesterId, branch, section, studentId, attendanceDate, subject, status } = req.body;
        
        const timetable = await Timetable.findOne({
            semesterId,
            branch,
            section,
            effectiveFrom: { $lte: new Date(attendanceDate) },
            effectiveTo: { $gte: new Date(attendanceDate) }
        }).sort({ effectiveFrom: -1 });

        if (!timetable) {
            return res.status(404).json({ success: false, message: "No timetable found for this date" });
        }

        const attendance = await Attendance.create({
    studentId, 
    attendanceDate, 
    timetableId: timetable._id, 
    subject, 
    status, 
    branch, 
    section, 
    semesterId
});
console.log("Attendance Saved:", attendance);

        res.status(201).json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getTimetableSubjects = async (req, res) => {
    try {
        const { semesterId, branch, section, attendanceDate } = req.query;

        // Create a date object and normalize to start of the day UTC
        const targetDate = new Date(attendanceDate);
        targetDate.setUTCHours(0, 0, 0, 0);

        const timetable = await Timetable.findOne({
            semesterId,
            branch,
            section,
            // Compare as date values to avoid timezone shifts
            effectiveFrom: { $lte: targetDate },
            effectiveTo: { $gte: targetDate }
        });

        if (!timetable) {
            console.log("No timetable found for:", targetDate);
            return res.status(200).json({ success: true, data: [] });
        }

        res.status(200).json({ success: true, data: timetable.subjects || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get Attendance History (The Main View)
const getAttendance = async (req, res) => {
    try {
        // Fetch all, sort by date descending (newest first)
        const attendance = await Attendance.find()
            .populate({
                path: 'timetableId',
                select: 'branch section subject' // Adjust these fields to match your Timetable model
            })
            .populate({
                path: 'semesterId',
                select: 'name' // Ensure your Semester model has a 'name' field
            })
            .sort({ attendanceDate: -1 })
            .lean(); // .lean() makes the output a plain JS object, which is faster for React

        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get Attendance Report (Filtered View)
const getAttendanceReport = async (req, res) => {
    try {
        const { semesterId, branch, section } = req.query;
        
        // Build filter object dynamically
        const filter = {};
        if (semesterId) filter.semesterId = semesterId;
        if (branch) filter.branch = branch;
        if (section) filter.section = section;

        const report = await Attendance.find(filter)
            .populate("timetableId")
            .populate("semesterId")
            .sort({ attendanceDate: -1 })
            .lean();

        res.status(200).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    markAttendance,
    getAttendanceReport,
    getAttendance,
};