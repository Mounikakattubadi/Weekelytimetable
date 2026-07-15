import { useEffect, useState } from "react";
import api from "../services/api";

export default function Attendance() {

    const [semesters, setSemesters] = useState([]);
    const [records, setRecords] = useState([]);

    const [form, setForm] = useState({
        semesterId: "",
        studentId: "",
        attendanceDate: "",
        subject: "",
        status: "Present",
    });

    useEffect(() => {
        loadSemesters();
        loadAttendance();
    }, []);

    const loadSemesters = async () => {
        try {
            const res = await api.get("/semesters");
            setSemesters(res.data.data);
        } catch (err) {
            console.log(err);
        }
    };

    const loadAttendance = async () => {
        try {
            const res = await api.get("/attendance");
            setRecords(res.data.data);
        } catch (err) {
            console.log(err);
        }
    };

    const submit = async () => {
        try {

            const res = await api.post("/attendance", form);

            alert(
                `Attendance Saved\nTimetable Used: ${new Date(
                    res.data.timetableVersion
                ).toLocaleDateString()}`
            );

            setForm({
                semesterId: "",
                studentId: "",
                attendanceDate: "",
                subject: "",
                status: "Present",
            });

            loadAttendance();

        } catch (err) {
            console.log(err);
            alert("Error Saving Attendance");
        }
    };

    return (
        <div className="container mt-4">

            <h2>Mark Attendance</h2>

            <select
                className="form-control mb-2"
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
                    <option
                        key={semester._id}
                        value={semester._id}
                    >
                        {semester.name}
                    </option>
                ))}

            </select>

            <input
                className="form-control mb-2"
                placeholder="Student ID"
                value={form.studentId}
                onChange={(e) =>
                    setForm({
                        ...form,
                        studentId: e.target.value,
                    })
                }
            />

            <input
                type="date"
                className="form-control mb-2"
                value={form.attendanceDate}
                onChange={(e) =>
                    setForm({
                        ...form,
                        attendanceDate: e.target.value,
                    })
                }
            />

            <input
                className="form-control mb-2"
                placeholder="Subject"
                value={form.subject}
                onChange={(e) =>
                    setForm({
                        ...form,
                        subject: e.target.value,
                    })
                }
            />

            <select
                className="form-control mb-3"
                value={form.status}
                onChange={(e) =>
                    setForm({
                        ...form,
                        status: e.target.value,
                    })
                }
            >
                <option>Present</option>
                <option>Absent</option>
            </select>

            <button
                className="btn btn-primary"
                onClick={submit}
            >
                Save Attendance
            </button>

            <hr />

            <h3>Attendance History</h3>

            <table className="table table-striped">

                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Date</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Timetable Version</th>
                    </tr>
                </thead>

                <tbody>

                    {records.map((record) => (
                        <tr key={record._id}>
                            <td>{record.studentId}</td>
                            <td>{record.attendanceDate.substring(0, 10)}</td>
                            <td>{record.subject}</td>
                            <td>{record.status}</td>
                            <td>
                                {record.timetableId
                                    ? new Date(record.timetableId.effectiveFrom)
                                        .toLocaleDateString()
                                    : "-"}
                            </td>
                        </tr>
                    ))}

                </tbody>

            </table>

        </div>
    );
}