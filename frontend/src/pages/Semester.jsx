import { useEffect, useState } from "react";
import api from "../services/api";
import styles from "./Semester.module.css"; // Import styles

export default function Semester() {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", startDate: "", endDate: "" });

  useEffect(() => { fetchSemesters(); }, []);

  const fetchSemesters = async () => {
    try {
      const res = await api.get("/semesters");
      setSemesters(res.data.data);
    } catch (err) { console.error(err); }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  const start = new Date(form.startDate);
  const end = new Date(form.endDate);

  if (start >= end) {
    return alert("End date must be after the start date.");
  }

  // 1. Check for Duplicate Names (Case-Insensitive)
  const isDuplicateName = semesters.some(s => 
    s.name.toLowerCase() === form.name.trim().toLowerCase()
  );

  if (isDuplicateName) {
    return alert(`Error: A semester named "${form.name}" already exists.`);
  }

  // 2. Check for Overlaps
  const isOverlapping = semesters.some(s => {
    const sStart = new Date(s.startDate);
    const sEnd = new Date(s.endDate);
    return start < sEnd && end > sStart;
  });

  if (isOverlapping) {
    return alert("Error: This semester overlaps with an existing one. Please choose different dates.");
  }

  setLoading(true);
  try {
    // Add trim() to clean up accidental whitespace
    await api.post("/semesters", { ...form, name: form.name.trim() });
    
    setForm({ name: "", startDate: "", endDate: "" });
    fetchSemesters();
    alert("Semester created successfully!");
  } catch (err) { 
    alert("Error: " + (err.response?.data?.message || err.message)); 
  } finally { 
    setLoading(false); 
  }
};

return (
    <div className={`container mt-4 ${styles.semesterContainer}`}>
      <div className={`card p-4 mb-4 shadow-sm ${styles.customCard}`}>
        <h2>Create Semester</h2>
        <form onSubmit={handleSubmit}>
          <input className="form-control mb-2" placeholder="Semester Name" name="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="row">
            <div className="col-md-6"><input className="form-control mb-2" type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div className="col-md-6"><input className="form-control mb-2" type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
          </div>
          <button className={`btn btn-primary ${styles.customButton}`} disabled={loading}>{loading ? "Saving..." : "Save Semester"}</button>
        </form>
      </div>
      
      <h3>Existing Semesters</h3>
      <div className={`table-responsive ${styles.tableContainer}`}>
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr><th>Name</th><th>Start</th><th>End</th></tr>
          </thead>
          <tbody>
            {semesters.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.startDate?.substring(0, 10)}</td>
                <td>{s.endDate?.substring(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}