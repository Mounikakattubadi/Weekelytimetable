import { useEffect, useState } from "react";
import api from "../services/api";

export default function Timetable() {
  const [semesters, setSemesters] = useState([]);
  const [timetables, setTimetables] = useState([]);

  const [form, setForm] = useState({
    semesterId: "",
    effectiveFrom: "",
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
    try {
      await api.post("/timetables", form);

      alert("Timetable Saved Successfully");

      setForm({
        semesterId: "",
        effectiveFrom: "",
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

      fetchTimetables();
    } catch (err) {
      console.log(err);
      alert("Error Saving Timetable");
    }
  };

  return (
    <div className="container mt-4">

      <h2>Create Timetable</h2>

      <select
        className="form-control mb-3"
        value={form.semesterId}
        onChange={(e) =>
          setForm({
            ...form,
            semesterId: e.target.value,
          })
        }
      >
        <option value="">Select Semester</option>

        {semesters.map((semester) => (
          <option key={semester._id} value={semester._id}>
            {semester.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        className="form-control mb-3"
        value={form.effectiveFrom}
        onChange={(e) =>
          setForm({
            ...form,
            effectiveFrom: e.target.value,
          })
        }
      />

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
        className="form-control mb-3"
        placeholder="Faculty"
        value={form.schedule[0].periods[0].faculty}
        onChange={(e) => {
          const updated = { ...form };
          updated.schedule[0].periods[0].faculty = e.target.value;
          setForm(updated);
        }}
      />

      <button
        className="btn btn-success"
        onClick={handleSave}
      >
        Save Timetable
      </button>

      <hr />

      <h3>Saved Timetables</h3>

      <table className="table table-bordered">

        <thead>
          <tr>
            <th>Semester</th>
            <th>Effective From</th>
            <th>Subject</th>
            <th>Faculty</th>
          </tr>
        </thead>

        <tbody>

          {timetables.map((tt) => (
            <tr key={tt._id}>
              <td>{tt.semesterId?.name}</td>
              <td>{tt.effectiveFrom.substring(0, 10)}</td>
              <td>{tt.schedule[0].periods[0].subject}</td>
              <td>{tt.schedule[0].periods[0].faculty}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}