import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workoutDates, setWorkoutDates] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ date: "", wodContent: "", myRecord: "", review: "", category: "" });
  const router = useRouter();

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await fetch("/api/getWoDs");
        if (!response.ok) throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
        const data = await response.json();

        const formattedData = data.map((workout) => {
          let workoutDate;
          if (workout.date?.seconds) {
            const utcDate = new Date(workout.date.seconds * 1000);
            const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000); // ✅ UTC → KST
            workoutDate = kstDate.toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }).replace(/\. /g, "-").replace(/\.$/, "");
          } else {
            workoutDate = workout.date;
          }
          return { ...workout, date: workoutDate };
        });

        setWorkouts(formattedData);
        setWorkoutDates([...new Set(formattedData.map((w) => w.date))]);
        const todayKST = new Date(Date.now() + 9 * 60 * 60 * 1000);
        const todayFormatted = todayKST.toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).replace(/\. /g, "-").replace(/\.$/, "");
        setFilteredWorkouts(formattedData.filter((w) => w.date === todayFormatted));
      } catch (err) {
        console.error("❌ 운동 기록 불러오기 오류:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const formattedDate = kstDate.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\. /g, "-").replace(/\.$/, "");

    setFilteredWorkouts(workouts.filter((w) => w.date === formattedDate));
  };

  const startEditing = (workout) => {
    setEditId(workout.id);
    setEditData({
      date: workout.date,
      wodContent: workout.wodContent,
      myRecord: workout.myRecord,
      review: workout.review,
      category: workout.category || "",
    });
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    const { date, wodContent, myRecord, review, category } = editData;
    if (!date || !wodContent || !myRecord || !review || !category) {
      alert("❌ 모든 필드를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("/api/updateWoD", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, ...editData }),
      });
      if (!response.ok) throw new Error("❌ 수정 실패");

      const updated = workouts.map((w) => (w.id === editId ? { ...w, ...editData } : w));
      setWorkouts(updated);
      setFilteredWorkouts(updated.filter((w) => w.date === editData.date));
      setEditId(null);
    } catch (err) {
      console.error(err);
      alert("❌ 수정 중 오류 발생");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const response = await fetch("/api/deleteWoD", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("❌ 삭제 실패");

      setWorkouts((prev) => prev.filter((w) => w.id !== id));
      setFilteredWorkouts((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error(err);
      alert("❌ 삭제 실패");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>운동 기록</h1>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => router.push("/dashboard")} style={{ padding: "10px 20px", background: "#ff9800", color: "white", borderRadius: "5px" }}>
          대시보드로 이동
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          calendarType="gregory"
          locale="en-US"
          tileContent={({ date, view }) => {
            const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
            const formattedDate = kstDate.toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }).replace(/\. /g, "-").replace(/\.$/, "");
            return view === "month" && workoutDates.includes(formattedDate) ? (
              <span style={{ color: "green", fontWeight: "bold" }}>✔</span>
            ) : null;
          }}
        />
      </div>

      {loading ? <p>⏳ 로딩 중...</p> : null}

      {filteredWorkouts.length === 0 ? (
        <p>해당 날짜에 운동 기록이 없습니다.</p>
      ) : (
        <div style={{ maxWidth: "600px", margin: "auto" }}>
          {filteredWorkouts.map((w) => (
            <div key={w.id} style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "5px", marginBottom: "15px", position: "relative" }}>
              {editId === w.id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <input type="date" value={editData.date} onChange={(e) => handleEditChange("date", e.target.value)} />
                  <textarea rows="4" value={editData.wodContent} onChange={(e) => handleEditChange("wodContent", e.target.value)} />
                  <input value={editData.myRecord} onChange={(e) => handleEditChange("myRecord", e.target.value)} />
                  <input value={editData.review} onChange={(e) => handleEditChange("review", e.target.value)} />
                  <input value={editData.category} onChange={(e) => handleEditChange("category", e.target.value)} />
                  <button onClick={saveEdit}>저장</button>
                  <button onClick={() => setEditId(null)}>취소</button>
                </div>
              ) : (
                <>
                  <h3>{w.title || "운동 기록"}</h3>
                  <p><small>📅 날짜: {w.date}</small></p>
                  <p><strong>🏋 카테고리:</strong> {w.category || "N/A"}</p>
                  <pre style={{ whiteSpace: "pre-wrap" }}>{w.wodContent}</pre>
                  <p><strong>나의 기록:</strong> {w.myRecord}</p>
                  <p><strong>WOD 후기:</strong> {w.review}</p>
                  <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "5px" }}>
                    <button onClick={() => startEditing(w)} style={{ background: "#2196F3", color: "white", borderRadius: "5px", padding: "5px" }}>수정</button>
                    <button onClick={() => handleDelete(w.id)} style={{ background: "#f44336", color: "white", borderRadius: "5px", padding: "5px" }}>삭제</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}