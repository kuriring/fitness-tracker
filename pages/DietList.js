import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogContent,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { format } from "date-fns";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import DietForm from "./DietForm";

export default function DietCalendarList() {
  const [logs, setLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userId, setUserId] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, "dietLogs"), where("userId", "==", userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLogs(data);
    });
    return () => unsubscribe();
  }, [userId]);

  const handleDelete = async (id) => {
    const confirm = window.confirm("정말 삭제할까요?");
    if (!confirm) return;
    await deleteDoc(doc(db, "dietLogs", id));
  };

  const handleEdit = (log) => {
    setEditData(log);
    setOpenForm(true);
  };

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const filteredLogs = logs.filter((log) => log.date === selectedDateStr);

  const total = filteredLogs.reduce(
    (acc, log) => {
      log.items.forEach((item) => {
        acc.kcal += item.kcal || 0;
        acc.carbs += item.carbs || 0;
        acc.protein += item.protein || 0;
        acc.fat += item.fat || 0;
      });
      return acc;
    },
    { kcal: 0, carbs: 0, protein: 0, fat: 0 }
  );

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Typography variant="h5" gutterBottom>
        📅 날짜별 식단 기록
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateCalendar
          value={selectedDate}
          onChange={(newDate) => setSelectedDate(newDate)}
          sx={{ mb: 3 }}
        />
      </LocalizationProvider>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle1">
          🧮 총합: {total.kcal} kcal | 탄 {total.carbs}g | 단 {total.protein}g | 지 {total.fat}g
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenForm(true)}>
          식단 추가
        </Button>
      </Box>

      {filteredLogs.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          해당 날짜에 저장된 식단이 없습니다.
        </Typography>
      ) : (
        filteredLogs.map((log) => {
          const totalKcal = log.items.reduce((sum, i) => sum + (i.kcal || 0), 0);
          return (
            <Box
              key={log.id}
              sx={{ mb: 3, p: 2, border: "1px solid #eee", borderRadius: 2 }}
            >
              <Box
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  🍽️ {log.meal}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip label={`총 ${totalKcal} kcal`} color="primary" />
                  <IconButton onClick={() => handleEdit(log)} size="small" color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(log.id)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

              <List dense>
                {log.items.map((item, i) => (
                  <ListItem key={i} sx={{ alignItems: "flex-start" }}>
                    <ListItemText
                      primary={item.name}
                      secondary={`칼로리: ${item.kcal}kcal | 탄: ${item.carbs}g | 단: ${item.protein}g | 지: ${item.fat}g`}
                    />
                  </ListItem>
                ))}
              </List>

              {log.memo && (
                <Typography variant="body2" sx={{ mt: 1, color: "#888" }}>
                  💬 메모: {log.memo}
                </Typography>
              )}
            </Box>
          );
        })
      )}

      <Dialog open={openForm} onClose={() => { setOpenForm(false); setEditData(null); }} fullWidth maxWidth="sm">
        <DialogContent>
          <DietForm
            userId={userId}
            date={selectedDate}
            editData={editData}
            onSubmitComplete={() => {
              setOpenForm(false);
              setEditData(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
