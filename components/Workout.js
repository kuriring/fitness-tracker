import { useState } from "react";
import { useRouter } from "next/router";

export default function Workout({ onSubmitComplete }) { // 🔥 props로 받아야 함
  const [wodContent, setWodContent] = useState("");
  const [myRecord, setMyRecord] = useState("");
  const [review, setReview] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const categories = ["FORCE", "CF", "MoMT", "MoMster Day", "CF ELITE"];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!wodContent || !myRecord || !review || !date || !category) {
      setMessage("❌ 모든 필드를 입력해야 합니다.");
      return;
    }

    try {
      const response = await fetch("/api/addWoD", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wodContent, myRecord, review, date, category }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ 운동 기록이 추가되었습니다!");
        setWodContent("");
        setMyRecord("");
        setReview("");
        setDate("");
        setCategory("");
        onSubmitComplete(); // 🔥 호출 시 문제없음
      } else {
        setMessage(`❌ 오류 발생: ${data.error}`);
      }
    } catch (error) {
      console.error("❌ 네트워크 오류 발생:", error);
      setMessage("❌ 서버와의 연결이 원활하지 않습니다.");
    }
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "600px", margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", fontSize: "28px", marginBottom: "30px" }}>
        🏋 운동 기록 추가 (Daily WoD)
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={inputStyle}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          style={inputStyle}
        >
          <option value="">📌 카테고리 선택</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <textarea
          placeholder="📝 운동 내용 (STRENGTH, METCON, SCALE 포함)"
          value={wodContent}
          onChange={(e) => setWodContent(e.target.value)}
          rows="5"
          required
          style={textareaStyle}
        />

        <textarea
          placeholder="💪 나의 기록 입력"
          value={myRecord}
          onChange={(e) => setMyRecord(e.target.value)}
          required
          style={textareaStyle}
        />

        <textarea
          placeholder="🗣 WOD 후기 입력"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          required
          style={textareaStyle}
        />

        <button type="submit" style={submitButtonStyle}>
          📥 기록 추가
        </button>
      </form>

      {message && (
        <p style={{ marginTop: "15px", fontWeight: "bold", textAlign: "center", color: message.includes("✅") ? "green" : "red" }}>
          {message}
        </p>
      )}

      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          ⬅ 대시보드로 이동
        </button>
      </div>
    </div>
  );
}

// ✅ 스타일 정의
const inputStyle = {
  padding: "12px",
  fontSize: "16px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const textareaStyle = {
  padding: "12px",
  fontSize: "16px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  resize: "vertical",
};

const submitButtonStyle = {
  padding: "12px",
  backgroundColor: "#4CAF50",
  color: "white",
  fontSize: "16px",
  borderRadius: "5px",
  border: "none",
  cursor: "pointer",
};