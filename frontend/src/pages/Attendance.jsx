import { useEffect, useState } from "react";
import api from "../services/api";

export default function Attendance() {
    const [semesters, setSemesters] = useState([]);
    const [records, setRecords] = useState([]);
    const [branches, setBranches] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [form, setForm] = useState({
        semesterId: "",
        branch: "",
        section: "",
        studentId: "",
        attendanceDate: "",
        subject: "",
        status: "Present",
    });

    useEffect(() => {
        loadSemesters();
        loadAttendance();
    }, []);

    // 1. Fetch Branches
    useEffect(() => {
        if (form.semesterId) {
            api.get(`/timetables/branches/${form.semesterId}`)
                .then(res => setBranches(res.data.data || []))
                .catch(err => console.error("Branches error", err));
        } else {
            setBranches([]);
        }
    }, [form.semesterId]);

    // 2. Fetch Sections
    useEffect(() => {
        if (form.semesterId && form.branch) {
            api.get(`/timetables/sections/${form.semesterId}/${form.branch}`)
                .then(res => setSections(res.data.data || []))
                .catch(err => console.error("Sections error", err));
        } else {
            setSections([]);
        }
    }, [form.branch]);

    // 3. Fetch Subjects
    useEffect(() => {
        const fetchSubjects = async () => {
            if (form.semesterId && form.branch && form.section && form.attendanceDate) {
                try {
                    const res = await api.get(`/timetables/subjects`, { params: form });
                    setSubjects(res.data.data || []);
                } catch (err) {
                    setSubjects([]);
                    console.error("Subjects error", err);
                }
            } else {
                setSubjects([]);
            }
        };
        fetchSubjects();
    }, [form.semesterId, form.branch, form.section, form.attendanceDate]);

    const loadSemesters = async () => {
        try {
            const res = await api.get("/semesters");
            setSemesters(res.data.data || []);
        } catch (err) { console.error(err); }
    };

    const loadAttendance = async () => {
        try {
            const res = await api.get("/attendance");
            setRecords(res.data.data || []);
        } catch (err) { console.error(err); }
    };

    const submit = async (e) => {
        e.preventDefault(); // Prevents page reload
        try {
            await api.post("/attendance", form);
            alert("Attendance Saved");
            setForm({
                semesterId: "", branch: "", section: "",
                studentId: "", attendanceDate: "", subject: "", status: "Present",
            });
            loadAttendance();
        } catch (err) {
            alert(err.response?.data?.message || "Error Saving Attendance");
        }
    };

    return (
        <div className="container mt-4">
            <h2>Mark Attendance</h2>
            <form onSubmit={submit}>
                <select className="form-control mb-2" value={form.semesterId} onChange={(e) => setForm({ ...form, semesterId: e.target.value })}>
                    <option value="">Select Semester</option>
                    {semesters?.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>

                <select className="form-control mb-2" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
                    <option value="">Select Branch</option>
                    {branches?.map(b => <option key={b} value={b}>{b}</option>)}
                </select>

                <select className="form-control mb-2" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
                    <option value="">Select Section</option>
                    {sections?.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <input className="form-control mb-2" placeholder="Student ID" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} />
                <input type="date" className="form-control mb-2" value={form.attendanceDate} onChange={(e) => setForm({ ...form, attendanceDate: e.target.value })} />

                <select
                    className="form-control mb-3"
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                >
                    <option value="">Select Subject</option>
                    {subjects.map((sub, index) => (
                        <option key={index} value={sub}>
                            {sub}
                        </option>
                    ))}
                </select>

                <select className="form-control mb-3" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option>Present</option>
                    <option>Absent</option>
                </select>

                <button type="submit" className="btn btn-primary w-100">Save Attendance</button>
            </form>

            <hr />
            <h3>Attendance History</h3>
            <table className="table table-striped">
                <thead>
                    <tr><th>Student</th><th>Class (Br/Sec)</th><th>Date</th><th>Subject</th><th>Status</th></tr>
                </thead>
                <tbody>
                    {records?.map((r) => (
                        <tr key={r._id}>
                            <td>{r.studentId}</td>
                            <td>{r.branch ? `${r.branch}-${r.section}` : `${r.timetableId?.branch || "N/A"}-${r.timetableId?.section || "N/A"}`}</td>
                            <td>{r.attendanceDate?.substring(0, 10)}</td>
                            <td>{r.subject}</td>
                            <td>{r.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}