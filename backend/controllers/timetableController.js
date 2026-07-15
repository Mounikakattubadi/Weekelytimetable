const Timetable = require("../models/Timetable");

const createTimetable = async (req, res) => {
    try {
        const { semesterId, branch, section, effectiveFrom, effectiveTo, schedule } = req.body;

        const normalizedBranch = branch.toUpperCase();
        const normalizedSection = section.toUpperCase();
        const newStartTime = schedule[0].periods[0].startTime;
        const newEndTime = schedule[0].periods[0].endTime;

        // Check for existing timetables in the same date range
        const overlapping = await Timetable.find({
            semesterId,
            branch: normalizedBranch,
            section: normalizedSection,
            effectiveFrom: { $lte: effectiveTo },
            effectiveTo: { $gte: effectiveFrom }
        });

        // Check if any of the overlapping records have a time conflict
        const hasTimeConflict = overlapping.some(tt => {
            return tt.schedule.some(day => {
                return day.periods.some(p => {
                    // Conflict if: (NewStart < ExistingEnd) AND (NewEnd > ExistingStart)
                    return newStartTime < p.endTime && newEndTime > p.startTime;
                });
            });
        });

        if (hasTimeConflict) {
            return res.status(400).json({
                success: false,
                message: "A class for this branch/section already exists for this date and time range.",
            });
        }

        const timetableData = {
            ...req.body,
            branch: normalizedBranch,
            section: normalizedSection
        };

        const timetable = await Timetable.create(timetableData);

        res.status(201).json({ success: true, data: timetable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get unique branches for a specific semester
const getBranchesBySemester = async (req, res) => {
    try {
        const { semesterId } = req.params;
        const branches = await Timetable.distinct("branch", { semesterId });
        
        res.status(200).json({
            success: true,
            data: branches,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get sections by branch
const getSectionsByBranch = async (req, res) => {
    try {
        const { semesterId, branch } = req.params;
        const sections = await Timetable.distinct("section", { semesterId, branch: branch.toUpperCase() });
        res.status(200).json({ success: true, data: sections });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSubjectsByClass = async (req, res) => {
    try {
        const { semesterId, branch, section, attendanceDate } = req.query;
        
        console.log("Backend Received Query:", { semesterId, branch, section, attendanceDate });

        const date = new Date(attendanceDate);
        
        const timetable = await Timetable.findOne({
            semesterId,
            branch: branch.toUpperCase(),
            section: section.toUpperCase(),
            effectiveFrom: { $lte: date },
            effectiveTo: { $gte: date }
        });

        console.log("Found Timetable:", timetable ? "Yes" : "No");

        let subjects = [];
        if (timetable && timetable.schedule) {
            const allSubjects = timetable.schedule.flatMap(day => 
                day.periods.map(p => p.subject)
            );
            subjects = [...new Set(allSubjects)];
        }
        
        console.log("Subjects found:", subjects);

        res.status(200).json({ success: true, data: subjects });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Get All Timetables
const getTimetables = async (req, res) => {
    try {
        const timetables = await Timetable.find()
            .populate("semesterId")
            .sort({ effectiveFrom: -1 });

        res.status(200).json({
            success: true,
            count: timetables.length,
            data: timetables,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// 6. SINGLE EXPORT AT THE BOTTOM
module.exports = {
    createTimetable,
    getTimetables,
    getBranchesBySemester,
    getSectionsByBranch,
    getSubjectsByClass
};