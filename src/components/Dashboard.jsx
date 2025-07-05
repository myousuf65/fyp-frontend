import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router";
import { PieChart, Pie, Legend, Cell, ResponsiveContainer } from "recharts";
import "../styling/dashboard.css";

const Dashboard = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [presentStudents, setPresentStudents] = useState(0);
  const [absentStudents, setAbsentStudents] = useState(0);
  const [leaveStudents, setLeaveStudents] = useState(0);
  const [exemptStudents, setExemptStudents] = useState(0);
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date());
  const [statuses, setStatuses] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const location = useLocation();

  useEffect(() => {
    let params = new URLSearchParams(location.search);
    let sessionid = params.get("sessionid");

    const ws = new WebSocket(
      `wss://faceback.ap.ngrok.io/ws/socket-server/${sessionid}/`
    );

    ws.onopen = function () {
      console.log("connected");
    };

    ws.onmessage = function (message) {
      console.log("received a message", message.data);
      let parsedResponse = JSON.parse(message.data);

      // Update students list and statuses
      setStudents(parsedResponse.students);
      setStatuses(parsedResponse.statuses);
      setAttendanceRecords(parsedResponse.attendance);

      // Get status IDs from statuses array
      const statusIds = {
        present: parsedResponse.statuses.find((s) => s.acronym === "P")?.id,
        absent: parsedResponse.statuses.find((s) => s.acronym === "A")?.id,
        leave: parsedResponse.statuses.find((s) => s.acronym === "L")?.id,
        exempt: parsedResponse.statuses.find((s) => s.acronym === "E")?.id,
      };

      // Calculate attendance statistics
      const totalCount = parsedResponse.students.length;
      const presentCount = parsedResponse.attendance.filter(
        (record) => record.statusid === statusIds.present?.toString()
      ).length;
      const absentCount = parsedResponse.attendance.filter(
        (record) => record.statusid === statusIds.absent?.toString()
      ).length;
      const leaveCount = parsedResponse.attendance.filter(
        (record) => record.statusid === statusIds.leave?.toString()
      ).length;
      const exemptCount = parsedResponse.attendance.filter(
        (record) => record.statusid === statusIds.exempt?.toString()
      ).length;

      setTotalStudents(totalCount);
      setPresentStudents(presentCount);
      setAbsentStudents(absentCount);
      setLeaveStudents(leaveCount);
      setExemptStudents(exemptCount);

      // Update pie chart data
      setAttendanceData([
        { name: "Present", value: presentCount },
        { name: "Absent", value: absentCount },
        { name: "On Leave", value: leaveCount },
        { name: "Exempted", value: exemptCount },
      ]);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleDateChange = (e) => {
    setDate(e.target.value ? new Date(e.target.value) : new Date());
  };

  const COLORS = {
    present: "#71bdff",
    absent: "#FF8042",
    leave: "#00C49F",
    exempt: "#FFBB28",
  };

  const getStatusText = (studentId) => {
    const attendanceRecord = attendanceRecords.find(
      (record) => record.studentid === studentId
    );
    if (!attendanceRecord) return "Not Marked";

    const status = statuses.find(
      (s) => s.id === parseInt(attendanceRecord.statusid)
    );
    return status ? status.acronym : "Unknown";
  };

  const getStatusId = (studentId) => {
    const attendanceRecord = attendanceRecords.find(
      (record) => record.studentid === studentId
    );
    if (!attendanceRecord) return null;
    return parseInt(attendanceRecord.statusid);
  };

  const renderStudentTable = (title, filterStatus) => {
    const filteredStudents = students.filter((student) => {
      const statusId = getStatusId(student.id);
      if (filterStatus === "present") {
        return statusId === statuses.find((s) => s.acronym === "P")?.id;
      } else {
        // Include students who are absent, on leave, exempt, or have not marked attendance
        return (
          statusId === statuses.find((s) => s.acronym === "A")?.id ||
          statusId === statuses.find((s) => s.acronym === "L")?.id ||
          statusId === statuses.find((s) => s.acronym === "E")?.id ||
          statusId === null
        );
      }
    });

    return (
      <div className="student-list">
        <h2>{title}</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>{`${student.firstname} ${student.lastname}`}</td>
                <td>{getStatusText(student.id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <h1>Attendance Dashboard</h1>

      <div className="summary-stats">
        <div className="stat-card">
          <h3>Total Students</h3>
          <p>{totalStudents}</p>
        </div>
        <div className="stat-card present">
          <h3>Present</h3>
          <p>{presentStudents}</p>
        </div>
        <div className="stat-card absent">
          <h3>Absent</h3>
          <p>{absentStudents}</p>
        </div>
        <div className="stat-card leave">
          <h3>On Leave</h3>
          <p>{leaveStudents}</p>
        </div>
        <div className="stat-card exempt">
          <h3>Exempted</h3>
          <p>{exemptStudents}</p>
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={attendanceData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
            >
              {attendanceData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    Object.values(COLORS)[index % Object.keys(COLORS).length]
                  }
                />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="tables-container">
        {renderStudentTable("Present", "present")}
        {renderStudentTable("Not in Class", "other")}
      </div>
    </div>
  );
};

export default Dashboard;
