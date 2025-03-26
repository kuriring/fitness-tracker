// pages/1rm-graph.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function OneRMGraph() {
  const router = useRouter();
  const { name } = router.query;
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (!name) return;
    const fetchData = async () => {
      const res = await fetch("/api/get1RMRecords");
      const all = await res.json();
      const filtered = all
        .filter((r) => r.name === name)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setRecords(filtered);
    };
    fetchData();
  }, [name]);

  return (
    <div style={{ padding: "30px", maxWidth: "800px", margin: "auto" }}>
      <h2 style={{ textAlign: "center" }}>📈 {name} 1RM 변화</h2>
      {records.length === 0 ? (
        <p>데이터가 없습니다.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={records}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" />
            <YAxis unit=" lb" />
            <Tooltip />
            <Line type="monotone" dataKey="weight" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}