import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

export default function WeightPage() {
  const [weight, setWeight] = useState("");
  const [weights, setWeights] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [openMonths, setOpenMonths] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [filterDays, setFilterDays] = useState(30);
  const [averageWeight, setAverageWeight] = useState(null);
  const [latestWeight, setLatestWeight] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchWeights();
  }, []);

  const fetchWeights = async () => {
    try {
      const q = query(collection(db, "weights"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => {
        const dateObj = doc.data().date?.toDate();
        const dateStr = dateObj?.toLocaleDateString("ko-KR");
        const year = dateObj?.getFullYear();
        const month = String(dateObj?.getMonth() + 1).padStart(2, "0");
        const yearMonth = `${year}-${month}`;

        return {
          id: doc.id,
          weight: doc.data().weight,
          date: dateStr,
          rawDate: dateObj,
          month: yearMonth,
          displayDate: dateStr,
        };
      });
      setWeights(data);

      const initialState = {};
      data.forEach((d) => {
        initialState[d.month] = true;
      });
      setOpenMonths(initialState);
    } catch (error) {
      console.error("❌ 체중 데이터 불러오기 오류:", error);
    }
  };

  useEffect(() => {
    const now = new Date();
    const filtered = weights
      .filter((entry) => entry.rawDate && entry.rawDate >= new Date(now.getTime() - filterDays * 86400000))
      .sort((a, b) => a.rawDate - b.rawDate);

    setFilteredData(filtered);

    if (filtered.length > 0) {
      const avg = (
        filtered.reduce((sum, e) => sum + e.weight, 0) / filtered.length
      ).toFixed(1);
      const latest = filtered[filtered.length - 1].weight.toFixed(1);
      setAverageWeight(avg);
      setLatestWeight(latest);
    } else {
      setAverageWeight(null);
      setLatestWeight(null);
    }
  }, [weights, filterDays]);

  const handleSubmit = async () => {
    if (!weight) return alert("체중을 입력해주세요!");

    try {
      if (editingId) {
        await updateDoc(doc(db, "weights", editingId), {
          weight: parseFloat(weight),
        });
        alert("체중이 수정되었습니다!");
        setEditingId(null);
      } else {
        await addDoc(collection(db, "weights"), {
          weight: parseFloat(weight),
          date: serverTimestamp(),
        });
        alert("체중이 저장되었습니다!");
      }
      setWeight("");
      fetchWeights();
    } catch (error) {
      console.error("❌ 체중 저장 오류:", error);
    }
  };

  const handleEdit = (item) => {
    setWeight(item.weight);
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, "weights", id));
      alert("삭제되었습니다.");
      fetchWeights();
    } catch (err) {
      console.error("❌ 삭제 오류:", err);
    }
  };

  const toggleMonth = (key) => {
    setOpenMonths((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const groupedByMonth = weights.reduce((acc, curr) => {
    if (!acc[curr.month]) acc[curr.month] = [];
    acc[curr.month].push(curr);
    return acc;
  }, {});

  const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => b.localeCompare(a));

  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "30px 20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", fontSize: "26px", marginBottom: "30px" }}>🏋 체중 기록 + 추이</h1>

      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => router.push("/dashboard")} style={navButtonStyle("#FF9800")}>⬅ 대시보드</button>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
        <input
          type="number"
          placeholder="체중 (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "16px",
            width: "150px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            backgroundColor: editingId ? "#FF9800" : "#4CAF50",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {editingId ? "수정 완료" : "저장"}
        </button>
      </div>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <select
          value={filterDays}
          onChange={(e) => setFilterDays(Number(e.target.value))}
          style={{ padding: "10px", borderRadius: "5px" }}
        >
          <option value={7}>최근 7일</option>
          <option value={30}>최근 30일</option>
          <option value={90}>최근 3개월</option>
          <option value={180}>최근 6개월</option>
          <option value={365}>최근 1년</option>
          <option value={10000}>전체 보기</option>
        </select>

        {(averageWeight || latestWeight) && (
          <p style={{ marginTop: "10px", fontSize: "16px", color: "#444" }}>
            📏 평균 체중: <strong>{averageWeight} kg</strong> 📌 최근 체중: <strong>{latestWeight} kg</strong>
          </p>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="displayDate" />
          <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
          <Tooltip />
          <Line type="monotone" dataKey="weight" stroke="#8884d8" strokeWidth={2} />
          {averageWeight && (
            <ReferenceLine y={Number(averageWeight)} stroke="red" strokeDasharray="4 4" label={{ value: `평균 ${averageWeight}kg`, position: "right", fill: "red" }} />
          )}
          {latestWeight && (
            <ReferenceLine y={Number(latestWeight)} stroke="#007bff" strokeDasharray="4 4" label={{ value: `최근 ${latestWeight}kg`, position: "right", fill: "#007bff" }} />
          )}
        </LineChart>
      </ResponsiveContainer>

      {sortedMonths.map((monthKey) => {
        const isOpen = openMonths[monthKey];
        const [year, month] = monthKey.split("-");
        return (
          <div key={monthKey} style={{ marginTop: "30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ color: "#333" }}>📅 {year}년 {month}월</h3>
              <button onClick={() => toggleMonth(monthKey)} style={{ padding: "4px 10px", background: "#eee", borderRadius: "5px", border: "none", cursor: "pointer" }}>
                {isOpen ? "접기 🔼" : "펼치기 🔽"}
              </button>
            </div>
            {isOpen && (
              <ul style={{ padding: 0, listStyle: "none" }}>
                {groupedByMonth[monthKey].map((w) => (
                  <li key={w.id} style={{ padding: "12px 15px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f9f9f9", borderRadius: "6px", marginBottom: "8px" }}>
                    <span>{w.date} - <strong>{w.weight} kg</strong></span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => handleEdit(w)} style={actionButtonStyle("#2196F3")}>수정</button>
                      <button onClick={() => handleDelete(w.id)} style={actionButtonStyle("#FF5733")}>삭제</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

const navButtonStyle = (color) => ({
  padding: "10px 16px",
  backgroundColor: color,
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
});

const actionButtonStyle = (color) => ({
  padding: "6px 10px",
  fontSize: "14px",
  backgroundColor: color,
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
});
