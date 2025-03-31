import { useState, useEffect } from "react";
import { useRouter } from "next/router";
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

export default function WeightEntry() {
  const [weight, setWeight] = useState("");
  const [weights, setWeights] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [openMonths, setOpenMonths] = useState({});
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
        const dateStr = dateObj?.toLocaleDateString("ko-KR"); // "2025. 4. 1."
        
        // ✅ 한국시간 기준으로 월을 계산
        const year = dateObj?.getFullYear();
        const month = String(dateObj?.getMonth() + 1).padStart(2, "0"); // 1~12
        const yearMonth = `${year}-${month}`; // "2025-04"
      
        return {
          id: doc.id,
          weight: doc.data().weight,
          date: dateStr,
          rawDate: dateObj,
          month: yearMonth,
        };
      });
      setWeights(data);

      // 초기 모든 month 열어놓기
      const initialState = {};
      data.forEach((d) => {
        initialState[d.month] = true;
      });
      setOpenMonths(initialState);
    } catch (error) {
      console.error("❌ 체중 데이터 불러오기 오류:", error);
    }
  };

  const handleSubmit = async () => {
    if (!weight) {
      alert("체중을 입력해주세요!");
      return;
    }

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

  const handleEdit = (weightData) => {
    setWeight(weightData.weight);
    setEditingId(weightData.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("정말로 삭제하시겠습니까?")) return;

    try {
      await deleteDoc(doc(db, "weights", id));
      alert("체중 기록이 삭제되었습니다.");
      fetchWeights();
    } catch (error) {
      console.error("❌ 체중 삭제 오류:", error);
    }
  };

  const toggleMonth = (monthKey) => {
    setOpenMonths((prev) => ({ ...prev, [monthKey]: !prev[monthKey] }));
  };

  // 월별 그룹화
  const groupedByMonth = weights.reduce((acc, record) => {
    if (!acc[record.month]) acc[record.month] = [];
    acc[record.month].push(record);
    return acc;
  }, {});
  const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => b.localeCompare(a));

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "30px 20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", fontSize: "26px", marginBottom: "30px" }}>🏋 체중 기록</h1>

      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => router.push("/dashboard")} style={navButtonStyle("#FF9800")}>⬅ 대시보드</button>
        <button onClick={() => router.push("/weight-trend")} style={navButtonStyle("#795548")}>📈 몸무게 추이</button>
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

      {/* 월별 리스트 */}
      {sortedMonths.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888" }}>체중 기록이 없습니다.</p>
      ) : (
        sortedMonths.map((monthKey) => {
          const [year, month] = monthKey.split("-");
          const monthLabel = `${year}년 ${month}월`;
          const isOpen = openMonths[monthKey];

          return (
            <div key={monthKey} style={{ marginBottom: "30px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ marginBottom: "10px", color: "#333", fontSize: "18px" }}>
                  📅 {monthLabel}
                </h3>
                <button
                  onClick={() => toggleMonth(monthKey)}
                  style={{
                    padding: "4px 10px",
                    background: "#eee",
                    borderRadius: "5px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {isOpen ? "접기 🔼" : "펼치기 🔽"}
                </button>
              </div>

              {isOpen && (
                <ul style={{ padding: 0, listStyle: "none" }}>
                  {groupedByMonth[monthKey].map((w) => (
                    <li
                      key={w.id}
                      style={{
                        padding: "12px 15px",
                        borderBottom: "1px solid #eee",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: "#f9f9f9",
                        borderRadius: "6px",
                        marginBottom: "8px",
                      }}
                    >
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
        })
      )}
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