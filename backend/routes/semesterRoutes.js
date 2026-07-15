const express = require("express");

const {
  createSemester,
  getSemesters,
} = require("../controllers/semesterController");

const router = express.Router();

router.post("/", createSemester);

router.get("/", getSemesters);

module.exports = router;