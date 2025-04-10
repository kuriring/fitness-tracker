import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export default function ExpenseForm({ onSubmitComplete }) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [payment, setPayment] = useState("");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState(new Date());

  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const ref = doc(db, "settings", "global");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setCategories(data.categories || { income: [], expense: [] });
          setPayments(Array.isArray(data.payments) ? data.payments : []);
        }
      } catch (err) {
        console.error("❌ 설정 불러오기 오류:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      amount: parseFloat(amount),
      type,
      category,
      payment,
      memo,
      date,
    };

    try {
      const res = await fetch("/api/addExpense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        alert("💾 저장 완료!");
        setAmount("");
        setCategory("");
        setPayment("");
        setMemo("");
        setDate(new Date());
        onSubmitComplete();
      } else {
        alert(`❌ 오류: ${result.error}`);
      }
    } catch (error) {
      alert("❌ 저장 중 오류 발생");
      console.error(error);
    }
  };

  const selectedCat = (categories[type] || []).find((c) => c.name === category);

  return (
    <form onSubmit={handleSubmit} style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>💰 가계부 입력</h2>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="날짜 선택"
          value={date}
          onChange={(newDate) => setDate(newDate)}
          slotProps={{ textField: { fullWidth: true, required: true } }}
        />
      </LocalizationProvider>

      <div style={{ marginTop: "15px", marginBottom: "15px" }}>
        <label>
          <input
            type="radio"
            name="type"
            value="income"
            checked={type === "income"}
            onChange={() => { setType("income"); setCategory(""); }}
          /> 수입
        </label>
        <label style={{ marginLeft: "15px" }}>
          <input
            type="radio"
            name="type"
            value="expense"
            checked={type === "expense"}
            onChange={() => { setType("expense"); setCategory(""); }}
          /> 지출
        </label>
      </div>

      <div style={{ marginBottom: "10px" }}>
        {selectedCat && (
          <div style={{ color: selectedCat.color }}>
            선택된 카테고리: {selectedCat.icon} <strong>{selectedCat.name}</strong>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          style={{ flex: 1, padding: "8px" }}
        >
          <option value="">카테고리 선택</option>
          {(categories[type] || []).map((cat, i) => (
            <option key={i} value={cat.name}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <select
          value={payment}
          onChange={(e) => setPayment(e.target.value)}
          required
          style={{ flex: 1, padding: "8px" }}
        >
          <option value="">결제 수단 선택</option>
          {payments.map((p, i) => (
            <option key={i} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <input
        type="number"
        placeholder="금액"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      <textarea
        placeholder="메모"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        style={{ width: "100%", minHeight: "80px", padding: "8px", marginBottom: "15px" }}
      />

      <button
        type="submit"
        style={{
          padding: "10px",
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          width: "100%",
        }}
      >
        저장
      </button>
      <div style={{ textAlign: "right", marginTop: "10px" }}>
  <a href="/settings" style={{ fontSize: "14px", color: "#555" }}>
    ⚙️ 카테고리 직접 관리하기
  </a>
</div>
    </form>
  );
}
