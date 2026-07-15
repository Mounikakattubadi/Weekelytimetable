import { useEffect, useState } from "react";
import api from "../services/api";
import styles from "./CreateTimetable.module.css"; // Import the module

export default function CreateTimetable() {
  const [semesters, setSemesters] = useState([]);
  const [custom, setCustom] = useState({ branch: false, section: false, subject: false });
  
  const getInitialState = () => ({
    semesterId: "", branch: "", section: "", effectiveFrom: "", effectiveTo: "",
    schedule: [{ day: "Monday", periods: [{ period: 1, startTime: "09:00", endTime: "10:00", subject: "", faculty: "" }] }]
  });

  const [form, setForm] = useState(getInitialState());

  const branches = ["CSE", "EEE", "ECE", "ME", "CIVIL", "IT"];
  const sections = ["A", "B", "C", "D"];
  const subjects = ["Maths", "Physics", "Chemistry", "Python", "Data Structures", "DBMS"];

  useEffect(() => {
    const fetchSemesters = async () => { 
      try { 
        const res = await api.get("/semesters"); 
        setSemesters(res.data?.data || []); 
      } catch (err) { console.error(err); } 
    };
    fetchSemesters();
  }, []);

const handleSave = async () => {
  // 1. Mandatory Field Validation
  if (!form.semesterId || !form.branch || !form.section || !form.effectiveFrom || !form.effectiveTo || !form.schedule[0].periods[0].subject) {
    alert("Please fill in all mandatory fields (Semester, Branch, Section, Dates, and Subject).");
    return;
  }

  // --- NEW: Semester Duration Validation ---
  const selectedSemester = semesters.find(s => s._id === form.semesterId);
  if (selectedSemester) {
    const semStart = new Date(selectedSemester.startDate);
    const semEnd = new Date(selectedSemester.endDate);
    const ttStart = new Date(form.effectiveFrom);
    const ttEnd = new Date(form.effectiveTo);

    if (ttStart < semStart || ttEnd > semEnd) {
      alert(`Error: Timetable dates must be within the semester duration (${selectedSemester.startDate.substring(0, 10)} to ${selectedSemester.endDate.substring(0, 10)}).`);
      return;
    }
  }
  // ------------------------------------------

  // 2. Date Sequence Validation
  const start = new Date(form.effectiveFrom);
  const end = new Date(form.effectiveTo);
  if (end <= start) {
    alert("Error: 'Effective To' date must be after 'Effective From' date.");
    return;
  }

  try {
    // 3. Fetch existing data to check for conflicts
    const res = await api.get("/timetables");
    const existing = res.data?.data || [];

    // 4. Conflict Logic
    const hasConflict = existing.some(tt => {
      const ttStart = new Date(tt.effectiveFrom);
      const ttEnd = new Date(tt.effectiveTo);
      
      const matchesCriteria = 
        tt.branch === form.branch &&
        tt.section === form.section &&
        tt.schedule?.[0]?.periods?.[0]?.subject === form.schedule[0].periods[0].subject;

      const datesOverlap = start < ttEnd && end > ttStart;

      const newStartTime = form.schedule[0].periods[0].startTime;
      const newEndTime = form.schedule[0].periods[0].endTime;
      const ttStartTime = tt.schedule?.[0]?.periods?.[0]?.startTime;
      const ttEndTime = tt.schedule?.[0]?.periods?.[0]?.endTime;

      const timesOverlap = newStartTime < ttEndTime && newEndTime > ttStartTime;

      return matchesCriteria && datesOverlap && timesOverlap;
    });

    if (hasConflict) {
      alert("Error: A class with this subject is already scheduled for this branch/section at this time and date range.");
      return;
    }

    // 5. Save the data
    await api.post("/timetables", form);
    alert("Timetable Saved Successfully!");
    
    // 6. Reset form
    setForm(getInitialState());
    setCustom({ branch: false, section: false, subject: false });

  } catch (err) {
    console.error("Save Error:", err);
    alert("Error saving timetable. Please check your connection.");
  }
};

  const renderField = (label, field, options, isNested = false) => (
    <div className={`col-md-${isNested ? "6" : "4"}`}>
      <label>{label}</label>
      {custom[field] ? (
        <input 
          className="form-control" 
          placeholder={`Enter Custom ${label}`} 
          value={isNested ? (form.schedule?.[0]?.periods?.[0]?.[field] || "") : (form[field] || "")} 
          onChange={(e) => isNested 
            ? setForm(prev => ({ ...prev, schedule: [{ ...prev.schedule[0], periods: [{ ...prev.schedule[0].periods[0], [field]: e.target.value }] }] })) 
            : setForm({ ...form, [field]: e.target.value })
          } 
        />
      ) : (
        <select 
          className="form-control" 
          value={isNested ? (form.schedule?.[0]?.periods?.[0]?.[field] || "") : (form[field] || "")}
          onChange={(e) => {
            if (e.target.value === "custom") {
              setCustom({ ...custom, [field]: true });
            } else {
              isNested 
                ? setForm(prev => ({ ...prev, schedule: [{ ...prev.schedule[0], periods: [{ ...prev.schedule[0].periods[0], [field]: e.target.value }] }] }))
                : setForm({ ...form, [field]: e.target.value });
            }
          }}
        >
          <option value="">Select</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
          <option value="custom" className="text-primary font-weight-bold">--- Enter Custom ---</option>
        </select>
      )}
    </div>
  );

return (
    <div className={`container mt-4 ${styles.container}`}>
      <h3 className={styles.header}>Create Timetable</h3>
      
      <div className="row g-3">
        <div className={`col-md-4 ${styles.inputGroup}`}>
          <label className={styles.label}>Semester</label>
          <select className="form-control" value={form.semesterId} onChange={(e) => setForm({...form, semesterId: e.target.value})}>
            <option value="">Select</option>
            {semesters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        
        {renderField("Branch", "branch", branches)}
        {renderField("Section", "section", sections)}
        
        <div className="col-md-3"><label className={styles.label}>Effective From</label><input type="date" className="form-control" value={form.effectiveFrom} onChange={(e) => setForm({...form, effectiveFrom: e.target.value})} /></div>
        <div className="col-md-3"><label className={styles.label}>Effective To</label><input type="date" className="form-control" value={form.effectiveTo} onChange={(e) => setForm({...form, effectiveTo: e.target.value})} /></div>
        
        <div className="col-md-3"><label className={styles.label}>Start Time</label><input type="time" className="form-control" value={form.schedule?.[0]?.periods?.[0]?.startTime || ""} onChange={(e) => setForm(prev => ({...prev, schedule: [{...prev.schedule[0], periods: [{...prev.schedule[0].periods[0], startTime: e.target.value}]}]}))} /></div>
        <div className="col-md-3"><label className={styles.label}>End Time</label><input type="time" className="form-control" value={form.schedule?.[0]?.periods?.[0]?.endTime || ""} onChange={(e) => setForm(prev => ({...prev, schedule: [{...prev.schedule[0], periods: [{...prev.schedule[0].periods[0], endTime: e.target.value}]}]}))} /></div>
        
        {renderField("Subject", "subject", subjects, true)}
        <div className="col-md-6"><label className={styles.label}>Faculty</label><input className="form-control" value={form.schedule?.[0]?.periods?.[0]?.faculty || ""} placeholder="Faculty Name" onChange={(e) => setForm(prev => ({...prev, schedule: [{...prev.schedule[0], periods: [{...prev.schedule[0].periods[0], faculty: e.target.value}]}]}))} /></div>
      </div>
      
      <button className={`btn btn-success mt-4 w-100 ${styles.saveButton}`} onClick={handleSave}>Save Timetable</button>
    </div>
  );

}