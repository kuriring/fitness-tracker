import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import DeleteIcon from "@mui/icons-material/Delete";
import { db } from "../lib/firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const getKSTDateString = (date) => {
  const offsetDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return offsetDate.toISOString().split("T")[0];
};

export default function DietForm({ userId, onSubmitComplete, editData, date: passedDate }) {
  const [date, setDate] = useState(
    editData?.date ? new Date(editData.date) : passedDate || new Date()
  );
  const [meal, setMeal] = useState(editData?.meal || "아침");
  const [items, setItems] = useState(
    editData?.items || [{ name: "", kcal: "", carbs: "", protein: "", fat: "" }]
  );
  const [memo, setMemo] = useState(editData?.memo || "");

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { name: "", kcal: "", carbs: "", protein: "", fat: "" },
    ]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    const data = {
      userId: user.uid,
      date: getKSTDateString(date), // ✅ KST 기준 날짜 저장
      meal,
      items: items.map((item) => ({
        ...item,
        kcal: parseFloat(item.kcal) || 0,
        carbs: parseFloat(item.carbs) || 0,
        protein: parseFloat(item.protein) || 0,
        fat: parseFloat(item.fat) || 0,
      })),
      memo,
    };

    try {
      if (editData?.id) {
        await updateDoc(doc(db, "dietLogs", editData.id), data);
        alert("✏️ 식단 수정 완료!");
      } else {
        await addDoc(collection(db, "dietLogs"), data);
        alert("✅ 식단 저장 완료!");
      }
      setItems([{ name: "", kcal: "", carbs: "", protein: "", fat: "" }]);
      setMemo("");
      setMeal("아침");
      setDate(new Date());
      if (onSubmitComplete) onSubmitComplete();
    } catch (err) {
      console.error("❌ 저장 실패:", err);
      alert("❌ 저장 중 오류 발생");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        {editData ? "✏️ 식단 수정" : "🍽️ 식단 기록"}
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="날짜 선택"
          value={date}
          onChange={(newValue) => setDate(newValue)}
          slotProps={{ textField: { fullWidth: true, required: true, sx: { mb: 2 } } }}
        />
      </LocalizationProvider>

      <TextField
        select
        label="끼니"
        value={meal}
        onChange={(e) => setMeal(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      >
        {["아침", "점심", "저녁", "간식"].map((m) => (
          <MenuItem key={m} value={m}>{m}</MenuItem>
        ))}
      </TextField>

      {items.map((item, index) => (
        <Box
          key={index}
          sx={{
            borderRadius: 2,
            p: 2,
            mb: 3,
            backgroundColor: "#fafafa",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <TextField
            label="음식명"
            value={item.name}
            onChange={(e) => handleItemChange(index, "name", e.target.value)}
            required
            fullWidth
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField label="칼로리" value={item.kcal} type="number" onChange={(e) => handleItemChange(index, "kcal", e.target.value)} fullWidth />
            <TextField label="탄" value={item.carbs} type="number" onChange={(e) => handleItemChange(index, "carbs", e.target.value)} fullWidth />
            <TextField label="단" value={item.protein} type="number" onChange={(e) => handleItemChange(index, "protein", e.target.value)} fullWidth />
            <TextField label="지" value={item.fat} type="number" onChange={(e) => handleItemChange(index, "fat", e.target.value)} fullWidth />
            <IconButton onClick={() => handleRemoveItem(index)} color="error" size="small">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      ))}

      <Button onClick={handleAddItem} variant="outlined" sx={{ mb: 2 }}>
        ➕ 음식 추가
      </Button>

      <TextField
        label="메모"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        multiline
        rows={3}
        fullWidth
        sx={{ mb: 2 }}
      />

      <Button
        variant="contained"
        type="submit"
        fullWidth
        sx={{ backgroundColor: "#4caf50", ":hover": { backgroundColor: "#43a047" } }}
      >
        {editData ? "✏️ 수정하기" : "✅ 식단 저장하기"}
      </Button>
    </Box>
  );
}
