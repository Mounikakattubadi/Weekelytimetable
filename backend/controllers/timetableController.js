const Timetable = require("../models/Timetable");

const createTimetable = async (req, res) => {
    try {
        const { semesterId, branch, section, effectiveFrom, effectiveTo, schedule } = req.body;

        const normalizedBranch = branch.toUpperCase();
        const normalizedSection = section.toUpperCase();
        
        // Extract the new period's details
        const newPeriod = schedule[0].periods[0];
        const newStartTime = newPeriod.startTime;
        const newEndTime = newPeriod.endTime;
        const newDate = new Date(newPeriod.date).setHours(0,0,0,0);

        // Find existing timetables that overlap the date range AND the specific date
        const overlapping = await Timetable.find({
            semesterId,
            branch: normalizedBranch,
            section: normalizedSection,
            effectiveFrom: { $lte: effectiveTo },
            effectiveTo: { $gte: effectiveFrom }
        });

        // Check if any existing record has a conflict ON THE SAME DATE AND TIME
        const hasConflict = overlapping.some(tt => {
            return tt.schedule.some(day => {
                return day.periods.some(p => {
                    const existingDate = new Date(p.date).setHours(0,0,0,0);
                    // Conflict if: Same Date AND Times Overlap
                    const isSameDay = existingDate === newDate;
                    const timesOverlap = newStartTime < p.endTime && newEndTime > p.startTime;
                    return isSameDay && timesOverlap;
                });
            });
        });

        if (hasConflict) {
            return res.status(400).json({
                success: false,
                message: "A class for this branch/section already exists for this specific date and time.",
            });
        }

        const timetable = await Timetable.create({
            ...req.body,
            branch: normalizedBranch,
            section: normalizedSection
        });

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
        
        const targetDate = new Date(attendanceDate).setHours(0,0,0,0);
        
        // Find timetable for this class
        const timetable = await Timetable.findOne({
            semesterId,
            branch: branch.toUpperCase(),
            section: section.toUpperCase(),
            effectiveFrom: { $lte: new Date(attendanceDate) },
            effectiveTo: { $gte: new Date(attendanceDate) }
        });

        let subjects = [];
        if (timetable) {
            // Filter periods that match the specific attendanceDate
            const allSubjects = timetable.schedule.flatMap(day => 
                day.periods
                    .filter(p => new Date(p.date).setHours(0,0,0,0) === targetDate)
                    .map(p => p.subject)
            );
            subjects = [...new Set(allSubjects)];
        }
        
        res.status(200).json({ success: true, data: subjects });
    } catch (error) {
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