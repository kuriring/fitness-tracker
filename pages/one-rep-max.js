import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { OneRMGraph } from "../components/OneRMGraph";

export default function OneRepMaxPage() {
  const [records, setRecords] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: "", weight: "", date: "" });
  const [newRecord, setNewRecord] = useState({ name: "", weight: "", date: "" });
  const [filter, setFilter] = useState("");
  const [visibleGraphs, setVisibleGraphs] = useState({});
  const router = useRouter();

  const exerciseOptions = [
    "Back Squat", "Front Squat", "Deadlift", "Bench Press",
    "Power Snatch","Squat Snatch", "Clean","Clean & Jerk", "Strict Press"
  ];

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch("/api/get1RMRecords");
        const data = await res.json();
        setRecords(data);
      } catch (error) {
        console.error("❌ 1RM 데이터 불러오기 실패:", error);
      }
    };
    fetchRecords();
  }, []);

  const groupedRecords = records.reduce((acc, r) => {
    if (!r.name.toLowerCase().includes(filter.toLowerCase())) return acc;
    acc[r.name] = acc[r.name] || [];
    acc[r.name].push(r);
    return acc;
  }, {});

  const startEditing = (record) => {
    setEditId(record.id);
    setEditData({ name: record.name, weight: record.weight, date: record.date });
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    try {
      const res = await fetch("/api/update1RM", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, ...editData }),
      });
      if (!res.ok) throw new Error("❌ 수정 실패");

      const updated = records.map((r) => (r.id === editId ? { ...r, ...editData } : r));
      setRecords(updated);
      setEditId(null);
    } catch (err) {
      console.error("❌ 수정 오류:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const res = await fetch("/api/delete1RM", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("❌ 삭제 실패");
      setRecords(records.filter((r) => r.id !== id));
    } catch (err) {
      console.error("❌ 삭제 오류:", err);
    }
  };

  const handleNewChange = (field, value) => {
    setNewRecord((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddRecord = async () => {
    const { name, weight, date } = newRecord;
    if (!name || !weight || !date) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    try {
      const res = await fetch("/api/add1RM", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      });
      const added = await res.json();
      const newEntry = { id: added.id, ...newRecord };
      setRecords([newEntry, ...records]);
      setNewRecord({ name: "", weight: "", date: "" });
    } catch (err) {
      console.error("❌ 추가 오류:", err);
    }
  };

  const toggleGraph = (name) => {
    setVisibleGraphs((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", fontSize: "2rem", marginBottom: "30px" }}>🏋️ 나의 1RM 기록실</h1>

      <div style={{ marginBottom: "20px", textAlign: "right" }}>
        <button onClick={() => router.push("/dashboard")} style={{ background: "#ff9800", color: "white", padding: "10px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
          🏠 대시보드로 이동
        </button>
      </div>

      <section style={{ background: "#f9fafb", padding: "25px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: "40px" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", marginBottom: "20px", borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
          🌟 1RM 기록 추가
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontWeight: "500", marginBottom: "4px" }}>운동 선택</label>
            <select value={newRecord.name} onChange={(e) => handleNewChange("name", e.target.value)} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "8px" }}>
              <option value="">-- 선택 --</option>
              {exerciseOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontWeight: "500", marginBottom: "4px" }}>무게 (파운드)</label>
            <input type="number" value={newRecord.weight} onChange={(e) => handleNewChange("weight", e.target.value)} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "8px" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontWeight: "500", marginBottom: "4px" }}>날짜</label>
            <input type="date" value={newRecord.date} onChange={(e) => handleNewChange("date", e.target.value)} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "8px" }} />
          </div>
          <button onClick={handleAddRecord} style={{ background: "#4CAF50", color: "white", padding: "12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>➕ 기록 추가</button>
        </div>
      </section>

      <input type="text" placeholder="운동 이름 검색" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: "10px", width: "100%", marginBottom: "30px", borderRadius: "8px", border: "1px solid #ccc" }} />

      {Object.entries(groupedRecords).map(([exercise, entries]) => (
        <section key={exercise} style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h2 style={{ fontSize: "1.3rem" }}>{exercise}</h2>
            <button onClick={() => toggleGraph(exercise)} style={{ background: "#2196F3", color: "white", borderRadius: "6px", padding: "6px 12px" }}>
              {visibleGraphs[exercise] ? "그래프 닫기" : "그래프 보기"}
            </button>
          </div>

          <AnimatePresence>
            {visibleGraphs[exercise] && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4 }}>
                <div style={{ background: "#e3f2fd", padding: "15px", borderRadius: "10px", marginBottom: "15px" }}>
                  <OneRMGraph data={entries} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {entries.map((r) => (
            <div key={r.id} style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "12px", marginBottom: "10px", background: "#fff", position: "relative" }}>
              {editId === r.id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <select value={editData.name} onChange={(e) => handleEditChange("name", e.target.value)}>
                    {exerciseOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <input type="number" value={editData.weight} onChange={(e) => handleEditChange("weight", e.target.value)} />
                  <input type="date" value={editData.date} onChange={(e) => handleEditChange("date", e.target.value)} />
                  <button onClick={saveEdit} style={{ background: "#4CAF50", color: "white", padding: "8px", borderRadius: "5px" }}>저장</button>
                </div>
              ) : (
                <>
                  <p><strong>{r.date}</strong> - {r.weight} lb</p>
                  <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "6px" }}>
                    <button onClick={() => startEditing(r)} style={{ background: "#888", color: "white", padding: "5px 8px", borderRadius: "5px" }}>수정</button>
                    <button onClick={() => handleDelete(r.id)} style={{ background: "#f44336", color: "white", padding: "5px 8px", borderRadius: "5px" }}>삭제</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}