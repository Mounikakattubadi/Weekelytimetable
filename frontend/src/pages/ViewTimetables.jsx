import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import styles from "./ViewTimetables.module.css";

export default function ViewTimetables() {
  const [timetables, setTimetables] = useState([]);
  const [filter, setFilter] = useState({ sem: "", branch: "", subject: "", date: "", time: "" });

  useEffect(() => {
    const fetchTimetables = async () => { 
      try { const res = await api.get("/timetables"); setTimetables(res.data.data); } 
      catch (err) { console.error(err); } 
    };
    fetchTimetables();
  }, []);

  // Flatten the data to handle multiple periods per timetable
  const flatData = useMemo(() => {
    return timetables.flatMap(tt => 
      tt.schedule.flatMap(day => 
        day.periods.map(p => ({
          ...p,
          ttId: tt._id,
          sem: tt.semesterId?.name,
          branch: tt.branch,
          section: tt.section,
          date: p.date ? p.date.split('T')[0] : ""
        }))
      )
    );
  }, [timetables]);

  const filteredData = useMemo(() => {
    return flatData.filter(item => 
      (!filter.sem || item.sem === filter.sem) &&
      (!filter.branch || item.branch === filter.branch) &&
      (!filter.subject || item.subject === filter.subject) &&
      (!filter.date || item.date === filter.date) &&
      (!filter.time || (filter.time >= item.startTime && filter.time <= item.endTime))
    );
  }, [flatData, filter]);

  return (
    <div className={`p-3 ${styles.container}`}>
      <h4 className={styles.header}>Saved Timetables</h4>
      
      <div className={`row g-2 mb-3`}>
        <div className="col-md-2">
            <input type="text" placeholder="Semester" className="form-control" onChange={(e) => setFilter({...filter, sem: e.target.value})} />
        </div>
        <div className="col-md-2">
            <input type="text" placeholder="Branch" className="form-control" onChange={(e) => setFilter({...filter, branch: e.target.value})} />
        </div>
        <div className="col-md-3">
          <input type="date" className="form-control" onChange={(e) => setFilter({...filter, date: e.target.value})} />
        </div>
        <div className="col-md-3">
          <input type="time" className="form-control" onChange={(e) => setFilter({...filter, time: e.target.value})} />
        </div>
      </div>
      
      <div className={styles.tableContainer}>
        <table className="table table-bordered table-striped">
          <thead className={styles.tableHeader}>
            <tr>
              <th>Sem</th><th>Branch</th><th>Sec</th><th>Subject</th><th>Date</th><th>Time</th><th>Faculty</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((p, index) => (
              <tr key={index}>
                <td>{p.sem}</td>
                <td>{p.branch}</td>
                <td>{p.section}</td>
                <td>{p.subject}</td>
                <td>{p.date}</td>
                <td>{p.startTime} - {p.endTime}</td>
                <td>{p.faculty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}