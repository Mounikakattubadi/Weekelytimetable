import { useEffect, useState } from "react";
import api from "../services/api";

export default function Semester() {
  const [semesters, setSemesters] = useState([]);

  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  const fetchSemesters = async () => {
    try {
      const res = await api.get("/semesters");
      setSemesters(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/semesters", form);

      setForm({
        name: "",
        startDate: "",
        endDate: "",
      });

      fetchSemesters();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container mt-4">

      <h2>Create Semester</h2>

      <form onSubmit={handleSubmit}>

        <input
          className="form-control mb-2"
          placeholder="Semester Name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          className="form-control mb-2"
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
        />

        <input
          className="form-control mb-2"
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
        />

        <button className="btn btn-primary">
          Save Semester
        </button>

      </form>

      <hr />

      <h3>Semesters</h3>

      <table className="table">

        <thead>
          <tr>
            <th>Name</th>
            <th>Start</th>
            <th>End</th>
          </tr>
        </thead>

        <tbody>

          {semesters.map((semester) => (
            <tr key={semester._id}>
              <td>{semester.name}</td>
              <td>{semester.startDate.substring(0, 10)}</td>
              <td>{semester.endDate.substring(0, 10)}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}