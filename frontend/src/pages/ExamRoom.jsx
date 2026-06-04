import { useParams } from "react-router-dom";

const ExamRoom = () => {
  const { id } = useParams();

  return (
    <div style={{ padding: "32px" }}>
      <h2>Exam Room - Coming in Phase 5</h2>
      <p>Exam ID: {id}</p>
    </div>
  );
};

export default ExamRoom;