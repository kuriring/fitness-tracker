import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns";
import { ko } from "date-fns/locale";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import styles from "../styles/BudgetDashboard.module.css";
import ExpenseForm from "../components/ExpenseForm";
import { Modal, Box } from "@mui/material";
import { useRouter } from "next/router";

export default function BudgetDashboard() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailySummary, setDailySummary] = useState({});
  const [summary, setSummary] = useState({ income: 0, expense: 0 });
  const [allData, setAllData] = useState([]);
  const [selectedDetailDate, setSelectedDetailDate] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // 🔧 날짜 포맷 안전 처리
  const getDateObj = (d) => {
    if (!d) return null;
    if (d instanceof Date) return d;
    if (typeof d.toDate === "function") return d.toDate();
    return new Date(d);
  };

  const fetchData = async () => {
    const snapshot = await getDocs(collection(db, "expenses"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setAllData(data);

    const currentMonth = format(selectedDate, "yyyy-MM");
    const filtered = data.filter((item) => {
      const date = getDateObj(item.date);
      return format(date, "yyyy-MM") === currentMonth;
    });

    const daily = {};
    let totalIncome = 0;
    let totalExpense = 0;

    filtered.forEach((item) => {
      const dateStr = format(getDateObj(item.date), "yyyy-MM-dd");
      if (!daily[dateStr]) daily[dateStr] = { income: 0, expense: 0 };
      if (item.type === "income") {
        daily[dateStr].income += item.amount;
        totalIncome += item.amount;
      } else {
        daily[dateStr].expense += item.amount;
        totalExpense += item.amount;
      }
    });

    setDailySummary(daily);
    setSummary({ income: totalIncome, expense: totalExpense });
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handleMonthChange = (offset) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedDate(newDate);
    setSelectedDetailDate(null);
  };

  const handleDateClick = (dateObj) => {
    const clickedDateStr = format(dateObj, "yyyy-MM-dd");
    setSelectedDetailDate(clickedDateStr);
  };

  const handleDelete = async (id) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, "expenses", id));
      fetchData();
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const detailEntries = allData.filter((entry) => {
    const dateStr = format(getDateObj(entry.date), "yyyy-MM-dd");
    return selectedDetailDate === dateStr;
  });

  const start = startOfMonth(selectedDate);
  const end = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start, end });
  const startDay = getDay(start);
  const blankDaysBefore = Array(startDay).fill(null);

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
            fontSize: "0.9rem",
          }}
        >
          ⬅️ Dashboard
        </button>
        <button onClick={() => handleMonthChange(-1)}>◀</button>
        <h2>{format(selectedDate, "yyyy년 M월", { locale: ko })}</h2>
        <button onClick={() => handleMonthChange(1)}>▶</button>
        <button className={styles.addButton} onClick={() => setShowForm(true)}>
          ＋
        </button>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <ExpenseForm
            onSubmitComplete={() => {
              fetchData();
              setShowForm(false);
            }}
          />
        </Box>
      </Modal>

      <div className={styles.summaryBox}>
        <span style={{ color: "green" }}>
          수입: {summary.income.toLocaleString()}원
        </span>
        <span style={{ color: "red", marginLeft: "10px" }}>
          지출: {summary.expense.toLocaleString()}원
        </span>
        <span style={{ marginLeft: "10px" }}>
          잔액: {(summary.income - summary.expense).toLocaleString()}원
        </span>
      </div>

      <div className={styles.weekdays}>
        {"일월화수목금토".split("").map((day, idx) => (
          <div key={idx} className={styles.weekday}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.calendarGrid}>
        {blankDaysBefore.map((_, idx) => (
          <div key={`blank-${idx}`} className={styles.dateCell}></div>
        ))}
        {daysInMonth.map((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const entry = dailySummary[dateStr];
          return (
            <div
              key={dateStr}
              className={styles.dateCell}
              onClick={() => handleDateClick(date)}
              style={{
                cursor: "pointer",
                backgroundColor:
                  selectedDetailDate === dateStr ? "#e3f2fd" : "white",
              }}
            >
              <div className={styles.day}>{format(date, "d")}</div>
              {entry?.income > 0 && (
                <div style={{ color: "green", fontSize: "0.8rem" }}>
                  +{entry.income.toLocaleString()}원
                </div>
              )}
              {entry?.expense > 0 && (
                <div style={{ color: "red", fontSize: "0.8rem" }}>
                  -{entry.expense.toLocaleString()}원
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDetailDate && (
        <div className={styles.detailBox}>
          <h3 style={{ marginBottom: "10px" }}>
            📅 {selectedDetailDate} 상세 내역
          </h3>
          {detailEntries.length === 0 ? (
            <p>내역이 없습니다.</p>
          ) : (
            <ul style={{ padding: 0, listStyle: "none" }}>
              {detailEntries.map((entry) => (
                <li
                  key={entry.id}
                  style={{
                    marginBottom: "8px",
                    fontSize: "0.95rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>
                    <strong>
                      {entry.type === "income" ? "💰 수입" : "💸 지출"}
                    </strong>{" "}
                    · {entry.category} · {entry.amount.toLocaleString()}원 ·{" "}
                    {entry.payment} · {entry.memo}
                  </span>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    style={{
                      marginLeft: "10px",
                      background: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      cursor: "pointer",
                    }}
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}