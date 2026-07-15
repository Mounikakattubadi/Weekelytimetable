import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import styles from "./ViewTimetables.module.css"; // Import the module

export default function ViewTimetables() {
  const [timetables, setTimetables] = useState([]);
  const [filter, setFilter] = useState({ sem: "", branch: "", subject: "", date: "", time: "" });

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      slots.push(`${hour < 10 ? "0" + hour : hour}:00`);
      slots.push(`${hour < 10 ? "0" + hour : hour}:30`);
    }
    return slots;
  }, []);

  useEffect(() => {
    const fetchTimetables = async () => { 
      try { const res = await api.get("/timetables"); setTimetables(res.data.data); } 
      catch (err) { console.error(err); } 
    };
    fetchTimetables();
  }, []);

  const options = useMemo(() => ({
    sems: [...new Set(timetables.map(tt => tt.semesterId?.name).filter(Boolean))],
    branches: [...new Set(timetables.map(tt => tt.branch).filter(Boolean))],
    subjects: [...new Set(timetables.map(tt => tt.schedule[0]?.periods[0]?.subject).filter(Boolean))]
  }), [timetables]);

  return (
    <div className={`p-3 ${styles.container}`}>
      <h4 className={styles.header}>Saved Timetables</h4>
      
      <div className={`row g-2 mb-3 ${styles.filterBar}`}>
        <div className="col-md-2">
          <select className="form-control" onChange={(e) => setFilter({...filter, sem: e.target.value})}>
            <option value="">All Semesters</option>
            {options.sems.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-control" onChange={(e) => setFilter({...filter, branch: e.target.value})}>
            <option value="">All Branches</option>
            {options.branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-control" onChange={(e) => setFilter({...filter, subject: e.target.value})}>
            <option value="">All Subjects</option>
            {options.subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <input type="date" className="form-control" onChange={(e) => setFilter({...filter, date: e.target.value})} />
        </div>
        <div className="col-md-3">
          <select className="form-control" onChange={(e) => setFilter({...filter, time: e.target.value})}>
            <option value="">All Times</option>
            {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      
      <div className={styles.tableContainer}>
        <table className="table table-bordered table-striped mb-0">
          <thead className={styles.tableHeader}>
            <tr>
              <th>Sem</th><th>Branch</th><th>Sec</th><th>Subject</th><th>Time</th>
              <th>Effective From</th><th>Effective To</th>
            </tr>
          </thead>
          <tbody>
            {timetables.filter(tt => 
              (!filter.sem || (tt.semesterId?.name || "") === filter.sem) &&
              (!filter.branch || (tt.branch || "") === filter.branch) &&
              (!filter.subject || (tt.schedule[0]?.periods[0]?.subject || "") === filter.subject) &&
              (!filter.date || (tt.effectiveFrom <= filter.date && tt.effectiveTo >= filter.date)) &&
              (!filter.time || (tt.schedule[0]?.periods[0]?.startTime <= filter.time && tt.schedule[0]?.periods[0]?.endTime >= filter.time))
            ).map(tt => (
              <tr key={tt._id}>
                <td>{tt.semesterId?.name}</td><td>{tt.branch}</td><td>{tt.section}</td>
                <td>{tt.schedule[0]?.periods[0]?.subject}</td>
                <td>{tt.schedule[0]?.periods[0]?.startTime} - {tt.schedule[0]?.periods[0]?.endTime}</td>
                <td>{tt.effectiveFrom ? tt.effectiveFrom.split('T')[0] : "-"}</td>
                <td>{tt.effectiveTo ? tt.effectiveTo.split('T')[0] : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}