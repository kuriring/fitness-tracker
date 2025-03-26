import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { db } from "../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function WeightTrend() {
  const [weightData, setWeightData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterDays, setFilterDays] = useState(30);
  const [averageWeight, setAverageWeight] = useState(null);
  const [latestWeight, setLatestWeight] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchWeights = async () => {
      try {
        const q = query(collection(db, "weights"), orderBy("date", "asc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          date: doc.data().date.toDate(),
          displayDate: doc.data().date.toDate().toLocaleDateString("ko-KR"),
          weight: doc.data().weight,
        }));
        setWeightData(data);
      } catch (err) {
        console.error("❌ 체중 데이터 불러오기 오류:", err);
      }
    };
    fetchWeights();
  }, []);

  useEffect(() => {
    const now = new Date();
    const filtered = weightData.filter(
      (entry) => entry.date >= new Date(now.getTime() - filterDays * 24 * 60 * 60 * 1000)
    );
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
  }, [weightData, filterDays]);

  return (
    <div style={{ padding: "20px", textAlign: "center", maxWidth: "900px", margin: "auto" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>📉 체중 변화 추이</h1>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            padding: "10px 15px",
            background: "#FF9800",
            color: "white",
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          🏠 대시보드로 돌아가기
        </button>

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
      </div>

      {/* ✅ 평균/최근 체중 텍스트 표시 */}
      {(averageWeight || latestWeight) && (
        <p style={{ marginBottom: "10px", fontSize: "18px", color: "#444" }}>
          {averageWeight && <>📏 평균 체중: <strong>{averageWeight} kg</strong> </>}
          {latestWeight && <>📌 최근 체중: <strong>{latestWeight} kg</strong></>}
        </p>
      )}

      {filteredData.length === 0 ? (
        <p>체중 기록이 없습니다.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="displayDate" />
            <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
            <Tooltip />
            <Line type="monotone" dataKey="weight" stroke="#8884d8" strokeWidth={2} />
            {averageWeight && (
              <ReferenceLine
                y={Number(averageWeight)}
                stroke="red"
                strokeDasharray="4 4"
                label={{ value: `평균 ${averageWeight}kg`, position: "right", fill: "red" }}
              />
            )}
            {latestWeight && (
              <ReferenceLine
                y={Number(latestWeight)}
                stroke="#007bff"
                strokeDasharray="4 4"
                label={{ value: `최근 ${latestWeight}kg`, position: "right", fill: "#007bff" }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}