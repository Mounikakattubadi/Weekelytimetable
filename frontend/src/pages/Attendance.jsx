import { useEffect, useState } from "react";
import api from "../services/api";
import styles from "./Attendance.module.css"; // Import the styles

export default function Attendance() {
    const [semesters, setSemesters] = useState([]);
    const [records, setRecords] = useState([]);
    const [branches, setBranches] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
    
    // Filter State
    const [filters, setFilters] = useState({ branch: "", section: "", subject: "" });

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

    // Filter Logic
    const filteredRecords = records.filter(r => {
        const recordBranch = r.branch || r.timetableId?.branch || "";
        const recordSection = r.section || r.timetableId?.section || "";
        return (
            (filters.branch === "" || recordBranch === filters.branch) &&
            (filters.section === "" || recordSection === filters.section) &&
            (filters.subject === "" || r.subject === filters.subject)
        );
    });

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

// Ensure 'async' is written before the function parameters
const submit = async (e) => {
    e.preventDefault();

    // 1. Find the selected semester
    const selectedSem = semesters.find(s => s._id === form.semesterId);
    
    if (!selectedSem) {
        alert("Please select a valid semester.");
        return;
    }

    // 2. Validate date (No await needed here, this is synchronous)
    const attendanceDate = new Date(form.attendanceDate);
    const semStart = new Date(selectedSem.startDate);
    const semEnd = new Date(selectedSem.endDate);

    if (attendanceDate < semStart || attendanceDate > semEnd) {
        alert("Error: Attendance date must be within the semester duration.");
        return;
    }

    // 3. API Call (THIS MUST HAVE AWAIT)
    try {
        await api.post("/attendance", form); // The 'await' keyword goes here
        alert("Attendance Saved");
        
        // Reset form
        setForm({
            semesterId: "", branch: "", section: "",
            studentId: "", attendanceDate: "", subject: "", status: "Present",
        });
        
        // Refresh list
        loadAttendance();
    } catch (err) {
        alert(err.response?.data?.message || "Error Saving Attendance");
    }
};

    return (
        <div className={`container mt-4 ${styles.container}`}>
            <h2 className={styles.header}>Mark Attendance</h2>
            <form onSubmit={submit} className={styles.formSection}>
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

                <select className="form-control mb-3" onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                    <option value="">Select Subject</option>
                    {subjects.map((sub, index) => <option key={index} value={sub}>{sub}</option>)}
                </select>

                <select className="form-control mb-3" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option>Present</option>
                    <option>Absent</option>
                </select>

                <button type="submit" className={`btn btn-primary w-100 ${styles.submitBtn}`}>Save Attendance</button>
            </form>

            <hr />

            {/* Filter Section */}
            <div className={`card p-3 mb-3 bg-light ${styles.filterCard}`}>
                <h5>Filter History</h5>
                <div className="row">
                    <div className="col-md-4">
                        <select className="form-control" onChange={(e) => setFilters({...filters, branch: e.target.value})}>
                            <option value="">All Branches</option>
                            {[...new Set(records.map(r => r.branch || r.timetableId?.branch))].filter(Boolean).map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div className="col-md-4">
                        <select className="form-control" onChange={(e) => setFilters({...filters, section: e.target.value})}>
                            <option value="">All Sections</option>
                            {[...new Set(records.map(r => r.section || r.timetableId?.section))].filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="col-md-4">
                        <select className="form-control" onChange={(e) => setFilters({...filters, subject: e.target.value})}>
                            <option value="">All Subjects</option>
                            {[...new Set(records.map(r => r.subject))].filter(Boolean).map((sub, i) => <option key={i} value={sub}>{sub}</option>)}
                        </select>
                    </div>
                </div>
            </div>

           <h3 className={styles.subHeader}>Attendance History</h3>
        <div className={styles.tableContainer}>
            <table className="table table-striped mb-0">
                <thead className={styles.tableHeader}>
                    <tr>
                        <th>Semester</th> {/* NEW COLUMN */}
                        <th>Student</th>
                        <th>Class (Br/Sec)</th>
                        <th>Date</th>
                        <th>Subject</th>
                        <th>Status</th>
                    </tr>
                </thead>
<tbody>
    {filteredRecords?.map((r) => {
        // Use the populated object directly
        // If r.semesterId is an object, use its name; otherwise fallback
        const semName = typeof r.semesterId === 'object' ? r.semesterId?.name : "N/A";
        
        return (
            <tr key={r._id}>
                <td>{semName}</td> 
                <td>{r.studentId}</td>
                <td>{r.branch ? `${r.branch}-${r.section}` : `${r.timetableId?.branch || "N/A"}-${r.timetableId?.section || "N/A"}`}</td>
                <td>{r.attendanceDate?.substring(0, 10)}</td>
                <td>{r.subject}</td>
                <td>{r.status}</td>
            </tr>
        );
    })}
</tbody>
            </table>
        </div>
    </div>
);
}