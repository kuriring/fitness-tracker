import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { ko } from "date-fns/locale";
import { useRouter } from "next/router";
import styles from "../styles/BudgetDashboard.module.css";
import { Modal, Box } from "@mui/material";
import Workout from "../components/Workout";

export default function Workouts() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workouts, setWorkouts] = useState([]);
  const [dailySummary, setDailySummary] = useState({});
  const [selectedDetailDate, setSelectedDetailDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ date: "", wodContent: "", myRecord: "", review: "", category: "" });
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/getWoDs");
      const data = await res.json();

      const formatted = data.map((w) => {
        let date = w.date;
        if (w.date?.seconds) {
          const utc = new Date(w.date.seconds * 1000);
          date = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
        } else if (typeof w.date === "string") {
          date = new Date(w.date);
        }
        return {
          ...w,
          _date: date,
          dateStr: format(date, "yyyy-MM-dd"),
        };
      });

      setWorkouts(formatted);

      const summary = {};
      formatted.forEach((w) => {
        if (!summary[w.dateStr]) summary[w.dateStr] = [];
        summary[w.dateStr].push(w);
      });

      setDailySummary(summary);
    } catch (err) {
      console.error("❌ 불러오기 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDateClick = (dateObj) => {
    setSelectedDetailDate(format(dateObj, "yyyy-MM-dd"));
    setEditId(null);
  };

  const handleMonthChange = (offset) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + offset));
  };

  const startEditing = (workout) => {
    setEditId(workout.id);
    setEditData({ ...workout });
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    const response = await fetch("/api/updateWoD", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editId, ...editData }),
    });

    if (response.ok) {
      fetchData();
      setEditId(null);
    } else {
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const response = await fetch("/api/deleteWoD", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      fetchData();
    } else {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const start = startOfMonth(selectedDate);
  const end = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start, end });
  const startDay = getDay(start);
  const blankDaysBefore = Array(startDay).fill(null);
  const detailEntries = dailySummary[selectedDetailDate] || [];

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
            <button
          onClick={() => router.push("/dashboard")}
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            padding: "6px 12px",
            backgroundColor: "#1976D2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.9rem"
          }}
        >
          ⬅️ Dashboard
        </button>

        <button onClick={() => handleMonthChange(-1)}>◀</button>
        <h2>{format(selectedDate, "yyyy년 M월", { locale: ko })}</h2>
        <button onClick={() => handleMonthChange(1)}>▶</button>
        <button
          className={styles.addButton}
          onClick={() => setShowForm(true)}
        >
          ＋
        </button>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <Box sx={modalStyle}>
          <Workout onSubmitComplete={() => {
            fetchData();
            setShowForm(false);
          }} />
        </Box>
      </Modal>

      <div className={styles.weekdays}>
        {"일월화수목금토".split("").map((day, idx) => (
          <div key={idx} className={styles.weekday}>{day}</div>
        ))}
      </div>

      <div className={styles.calendarGrid}>
        {blankDaysBefore.map((_, idx) => <div key={`blank-${idx}`} className={styles.dateCell}></div>)}
        {daysInMonth.map((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          return (
            <div
              key={dateStr}
              className={styles.dateCell}
              onClick={() => handleDateClick(date)}
              style={{ cursor: "pointer", backgroundColor: selectedDetailDate === dateStr ? "#e3f2fd" : "white" }}
            >
              <div className={styles.day}>{format(date, "d")}</div>
              {dailySummary[dateStr] && <div style={{ color: "green", fontSize: "0.8rem" }}>✔️</div>}
            </div>
          );
        })}
      </div>

      {loading && <p>⏳ 로딩 중...</p>}
      {selectedDetailDate && (
        <div className={styles.detailBox}>
          <h3>📅 {selectedDetailDate} 운동 내역</h3>
          {detailEntries.length === 0 ? (
            <p>기록이 없습니다.</p>
          ) : (
            detailEntries.map((w) => (
              <div
                key={w.id}
                style={{
                  borderBottom: "1px solid #ddd",
                  padding: "12px",
                  marginBottom: "12px",
                  position: "relative",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {editId === w.id ? (
                  <>
                    <input
                      type="text"
                      value={editData.category}
                      onChange={(e) => handleEditChange("category", e.target.value)}
                      style={{ width: "100%", marginBottom: "5px", padding: "6px" }}
                      placeholder="카테고리"
                    />
                    <textarea
                      value={editData.wodContent}
                      onChange={(e) => handleEditChange("wodContent", e.target.value)}
                      style={{ width: "100%", marginBottom: "5px", padding: "6px" }}
                      placeholder="운동 내용"
                    />
                    <input
                      type="text"
                      value={editData.myRecord}
                      onChange={(e) => handleEditChange("myRecord", e.target.value)}
                      style={{ width: "100%", marginBottom: "5px", padding: "6px" }}
                      placeholder="나의 기록"
                    />
                    <input
                      type="text"
                      value={editData.review}
                      onChange={(e) => handleEditChange("review", e.target.value)}
                      style={{ width: "100%", marginBottom: "5px", padding: "6px" }}
                      placeholder="후기"
                    />
                    <div style={{ textAlign: "right", marginTop: "8px" }}>
                      <button
                        onClick={saveEdit}
                        style={{
                          backgroundColor: "#4caf50",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          marginRight: "6px",
                        }}
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        style={{
                          backgroundColor: "#9e9e9e",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        취소
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p><strong>카테고리:</strong> {w.category || "없음"}</p>
                    <pre style={{ whiteSpace: "pre-wrap" }}><strong>운동 내용:</strong> {w.wodContent}</pre>
                    <p><strong>나의 기록:</strong> {w.myRecord}</p>
                    <p><strong>후기:</strong> {w.review}</p>
                    <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                      <button
                        onClick={() => startEditing(w)}
                        style={{
                          backgroundColor: "#2196f3",
                          color: "white",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          marginRight: "6px",
                        }}
                      >
                        ✏️ 수정
                      </button>
                      <button
                        onClick={() => handleDelete(w.id)}
                        style={{
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        🗑 삭제
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const modalStyle = {
  position: "absolute",
  top: "50%", left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600, bgcolor: "background.paper",
  boxShadow: 24, p: 4, borderRadius: 2,
};