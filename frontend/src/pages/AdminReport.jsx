import { useParams } from "react-router-dom";

const AdminReport = () => {
  const { examId, studentId } = useParams();

  return (
    <div style={{ padding: "32px" }}>
      <h2>Report Page - Coming in Phase 6</h2>
      <p>Exam ID: {examId}</p>
      <p>Student ID: {studentId}</p>
    </div>
  );
};

export default AdminReport;