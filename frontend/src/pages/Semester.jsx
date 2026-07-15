import { useEffect, useState } from "react";
import api from "../services/api";

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
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      return alert("End date must be after the start date.");
    }
    setLoading(true);
    try {
      await api.post("/semesters", form);
      setForm({ name: "", startDate: "", endDate: "" });
      fetchSemesters();
      alert("Semester created successfully!");
    } catch (err) { alert("Error: " + (err.response?.data?.message || err.message)); }
    finally { setLoading(false); }
  };

  return (
    <div className="container mt-4">
      <div className="card p-4 mb-4 shadow-sm">
        <h2>Create Semester</h2>
        <form onSubmit={handleSubmit}>
          <input className="form-control mb-2" placeholder="Semester Name" name="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="row">
            <div className="col-md-6"><input className="form-control mb-2" type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div className="col-md-6"><input className="form-control mb-2" type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
          </div>
          <button className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : "Save Semester"}</button>
        </form>
      </div>
      <h3>Existing Semesters</h3>
      <div className="table-responsive"><table className="table table-striped table-hover"><thead className="table-dark"><tr><th>Name</th><th>Start</th><th>End</th></tr></thead><tbody>{semesters.map((s) => (<tr key={s._id}><td>{s.name}</td><td>{s.startDate?.substring(0, 10)}</td><td>{s.endDate?.substring(0, 10)}</td></tr>))}</tbody></table></div>
    </div>
  );
}