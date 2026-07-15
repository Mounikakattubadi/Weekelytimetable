import { useEffect, useState } from "react";
import api from "../services/api";

export default function Timetable() {
  const [semesters, setSemesters] = useState([]);
  const [timetables, setTimetables] = useState([]);

  const [form, setForm] = useState({
    semesterId: "",
    branch: "",
    section: "",
    effectiveFrom: "",
    effectiveTo: "",
    schedule: [
      {
        day: "Monday",
        periods: [
          {
            period: 1,
            subject: "",
            faculty: "",
          },
        ],
      },
    ],
  });

  useEffect(() => {
    fetchSemesters();
    fetchTimetables();
  }, []);

  const fetchSemesters = async () => {
    try {
      const res = await api.get("/semesters");
      setSemesters(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchTimetables = async () => {
    try {
      const res = await api.get("/timetables");
      setTimetables(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

 const handleSave = async () => {
    // 1. Validation: Ensure all fields are filled
    if (!form.semesterId || !form.branch || !form.section || !form.effectiveFrom || !form.effectiveTo) {
      alert("Please fill in all fields.");
      return;
    }

    // 2. Validation: Ensure 'Effective To' is not before 'Effective From'
    const start = new Date(form.effectiveFrom);
    const end = new Date(form.effectiveTo);
    
    if (end < start) {
      alert("Error: 'Effective To' date cannot be before 'Effective From' date.");
      return;
    }

    // 3. Validation: Check for existing overlaps in your saved timetables
    const isTaken = timetables.some((tt) => {
      const ttStart = new Date(tt.effectiveFrom);
      const ttEnd = new Date(tt.effectiveTo);
      
      return (
        tt.semesterId?._id === form.semesterId &&
        tt.branch === form.branch &&
        tt.section === form.section &&
        start <= ttEnd &&
        end >= ttStart
      );
    });

    if (isTaken) {
      alert("Error: A timetable for this branch/section already exists for these dates.");
      return;
    }

    // 4. If all checks pass, proceed to save
    try {
      await api.post("/timetables", form);
      alert("Timetable Saved Successfully");
      
      // Reset form
      setForm({
        semesterId: "",
        branch: "",
        section: "",
        effectiveFrom: "",
        effectiveTo: "",
        schedule: [
          {
            day: "Monday",
            periods: [{ period: 1, subject: "", faculty: "" }],
          },
        ],
      });
      fetchTimetables();
    } catch (err) {
      console.log(err);
      alert("Error Saving Timetable: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container mt-4">
      <h2>Create Timetable</h2>

      <div className="row mb-3">
        <div className="col-md-4">
          <select
            className="form-control"
            value={form.semesterId}
            onChange={(e) => setForm({ ...form, semesterId: e.target.value })}
          >
            <option value="">Select Semester</option>
            {semesters.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Branch (e.g., CSE)"
            value={form.branch}
            onChange={(e) => setForm({ ...form, branch: e.target.value })}
          />
        </div>
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Section (e.g., A)"
            value={form.section}
            onChange={(e) => setForm({ ...form, section: e.target.value })}
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label>Effective From</label>
          <input
            type="date"
            className="form-control"
            value={form.effectiveFrom}
            onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
          />
        </div>
        <div className="col-md-6">
          <label>Effective To</label>
          <input
            type="date"
            className="form-control"
            value={form.effectiveTo}
            onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })}
          />
        </div>
      </div>

      <div className="mb-3">
        <input
          className="form-control mb-2"
          placeholder="Subject"
          value={form.schedule[0].periods[0].subject}
          onChange={(e) => {
            const updated = { ...form };
            updated.schedule[0].periods[0].subject = e.target.value;
            setForm(updated);
          }}
        />
        <input
          className="form-control"
          placeholder="Faculty"
          value={form.schedule[0].periods[0].faculty}
          onChange={(e) => {
            const updated = { ...form };
            updated.schedule[0].periods[0].faculty = e.target.value;
            setForm(updated);
          }}
        />
      </div>

      <button className="btn btn-success" onClick={handleSave}>
        Save Timetable
      </button>

      <hr />

      <h3>Saved Timetables</h3>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Semester</th>
            <th>Branch</th>
            <th>Sec</th>
            <th>From</th>
            <th>To</th>
            <th>Subject</th>
          </tr>
        </thead>
        <tbody>
          {timetables.map((tt) => (
            <tr key={tt._id}>
              <td>{tt.semesterId?.name}</td>
              <td>{tt.branch}</td>
              <td>{tt.section}</td>
              <td>{tt.effectiveFrom?.substring(0, 10)}</td>
              <td>{tt.effectiveTo?.substring(0, 10)}</td>
              <td>{tt.schedule[0]?.periods[0]?.subject}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}