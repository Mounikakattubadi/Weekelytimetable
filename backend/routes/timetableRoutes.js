const express = require("express");
const router = express.Router();
const { 
    createTimetable, 
    getTimetables, 
    getBranchesBySemester, 
    getSectionsByBranch, 
    getSubjectsByClass 
} = require("../controllers/timetableController");

router.post("/", createTimetable);
router.get("/", getTimetables);
router.get("/branches/:semesterId", getBranchesBySemester);
router.get("/sections/:semesterId/:branch", getSectionsByBranch);
router.get("/subjects", getSubjectsByClass); // Ensure this is not before /branches or /sections

module.exports = router;