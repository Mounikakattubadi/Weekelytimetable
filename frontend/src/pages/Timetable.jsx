import { useState } from "react";
import CreateTimetable from "./CreateTimetable.jsx";
import ViewTimetables from "./ViewTimetables.jsx";

export default function Timetable() {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <div className="container mt-4">
      <div className="btn-group mb-4">
        <button className={`btn ${activeTab === 'create' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('create')}>Create Timetable</button>
        <button className={`btn ${activeTab === 'view' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('view')}>View & Filter</button>
      </div>
      {activeTab === 'create' ? <CreateTimetable /> : <ViewTimetables />}
    </div>
  );
}