// ExpenseForm.js
import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function ExpenseForm({ onSubmitComplete }) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [payment, setPayment] = useState("");
  const [memo, setMemo] = useState("");

  const [categories, setCategories] = useState([]);
  const [payments, setPayments] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [newItem, setNewItem] = useState("");

  // 🔄 Firestore에서 카테고리 및 결제 수단 불러오기
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const ref = doc(db, "settings", "global");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          console.log("📦 불러온 설정 데이터:", data); // ✅ 추가
          setCategories(Array.isArray(data.categories) ? data.categories : []);
          setPayments(Array.isArray(data.payments) ? data.payments : []);
        } else {
          console.log("📛 설정 문서가 존재하지 않음!");
        }
      } catch (err) {
        console.error("❌ 설정 불러오기 오류:", err);
      }
    };
    fetchSettings();
  }, []);

  const updateSettings = async (field, updatedList) => {
    const settingsRef = doc(db, "settings", "global");
    await updateDoc(settingsRef, { [field]: updatedList });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      amount: parseFloat(amount),
      type,
      category,
      payment,
      memo,
      date: new Date(),
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
        onSubmitComplete();
      } else {
        alert(`❌ 오류: ${result.error}`);
      }
    } catch (error) {
      alert("❌ 저장 중 오류 발생");
      console.error(error);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.trim()) return;
    if (modalType === "category") {
      const updated = [...categories, newItem];
      setCategories(updated);
      setCategory(newItem);
      await updateSettings("categories", updated);
    } else if (modalType === "payment") {
      const updated = [...payments, newItem];
      setPayments(updated);
      setPayment(newItem);
      await updateSettings("payments", updated);
    }
    setNewItem("");
    setOpenModal(false);
  };

  const handleDeleteItem = async (type) => {
    if (type === "category" && category) {
      const updated = categories.filter((c) => c !== category);
      setCategories(updated);
      setCategory("");
      await updateSettings("categories", updated);
    } else if (type === "payment" && payment) {
      const updated = payments.filter((p) => p !== payment);
      setPayments(updated);
      setPayment("");
      await updateSettings("payments", updated);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>💰 가계부 입력</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>
          <input
            type="radio"
            name="type"
            value="income"
            checked={type === "income"}
            onChange={() => setType("income")}
          />
          수입
        </label>
        <label style={{ marginLeft: "15px" }}>
          <input
            type="radio"
            name="type"
            value="expense"
            checked={type === "expense"}
            onChange={() => setType("expense")}
          />
          지출
        </label>
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          style={{ flex: 1, padding: "8px" }}
        >
          <option value="">카테고리 선택</option>
          {categories.map((cat, i) => (
            <option key={i} value={cat}>{cat}</option>
          ))}
        </select>
        <button type="button" onClick={() => { setModalType("category"); setOpenModal(true); }}>➕ 추가</button>
        <button type="button" onClick={() => handleDeleteItem("category")}>🗑 삭제</button>
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
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
        <button type="button" onClick={() => { setModalType("payment"); setOpenModal(true); }}>➕ 추가</button>
        <button type="button" onClick={() => handleDeleteItem("payment")}>🗑 삭제</button>
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

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {modalType === "category" ? "카테고리 추가" : "결제 수단 추가"}
          </Typography>
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={modalType === "category" ? "새 카테고리 입력" : "새 결제 수단 입력"}
            style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
          />
          <Button variant="contained" onClick={handleAddItem} fullWidth>
            추가
          </Button>
        </Box>
      </Modal>
    </form>
  );
}