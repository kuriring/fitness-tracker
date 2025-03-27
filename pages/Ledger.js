import React, { useState } from "react";
import { Modal, Box, Typography, Button } from "@mui/material";

export default function ExpenseForm() {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [payment, setPayment] = useState("");
  const [memo, setMemo] = useState("");

  const [categories, setCategories] = useState(["식비", "교통", "쇼핑"]);
  const [payments, setPayments] = useState(["현대", "국민", "현금"]);

  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [newItem, setNewItem] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const data = {
      amount: parseFloat(amount),
      type,
      category,
      payment,
      memo,
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
        // 입력 초기화
        setAmount("");
        setCategory("");
        setPayment("");
        setMemo("");
      } else {
        alert(`❌ 오류: ${result.error}`);
      }
    } catch (error) {
      alert("❌ 저장 중 오류 발생");
      console.error(error);
    }
  };

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    if (modalType === "category") {
      setCategories([...categories, newItem]);
      setCategory(newItem);
    } else if (modalType === "payment") {
      setPayments([...payments, newItem]);
      setPayment(newItem);
    }
    setNewItem("");
    setOpenModal(false);
  };

  const handleDeleteItem = (type) => {
    if (type === "category" && category) {
      setCategories(categories.filter((c) => c !== category));
      setCategory("");
    } else if (type === "payment" && payment) {
      setPayments(payments.filter((p) => p !== payment));
      setPayment("");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>💰 가계부 입력</h2>

      {/* 🔄 수입/지출 선택 - 최상단 이동 */}
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

      {/* 📂 카테고리 */}
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

      {/* 💳 결제 수단 */}
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

      {/* 💵 금액 */}
      <input
        type="number"
        placeholder="금액"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      {/* 📝 메모 */}
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

      {/* 📦 추가 모달 */}
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