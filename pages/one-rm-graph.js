import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function OneRmGraph() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedLift, setSelectedLift] = useState("bench press");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/getOneRms");
        const data = await res.json();
        setRecords(data);
      } catch (err) {
        console.error("❌ 1RM 데이터 불러오기 오류:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filteredData = records
      .filter((r) => r.liftType === selectedLift)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    setFiltered(filteredData);
  }, [records, selectedLift]);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>📈 나의 1RM 기록 추이</h1>
      <button
        onClick={() => router.push("/one-rep-max")}
        style={{ marginBottom: "20px", padding: "10px", background: "#666", color: "white", borderRadius: "5px" }}
      >
        ← 1RM 기록실로 이동
      </button>
      <br />
      <select
        value={selectedLift}
        onChange={(e) => setSelectedLift(e.target.value)}
        style={{ padding: "8px", marginBottom: "20px" }}
      >
        {[...new Set(records.map((r) => r.liftType))].map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>

      {filtered.length === 0 ? (
        <p>해당 리프트의 기록이 없습니다.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={filtered}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Line type="monotone" dataKey="weight" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}