// components/OneRMGraph.js
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    defs,
    linearGradient,
    stop,
  } from "recharts";
  
  export function OneRMGraph({ data }) {
    const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    const formatted = sorted.map((item) => ({
      date: item.date,
      weight: parseFloat(item.weight),
    }));
  
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formatted} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          {/* 배경 그라디언트 정의 */}
          <defs>
            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4CAF50" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#4CAF50" stopOpacity={0.1} />
            </linearGradient>
          </defs>
  
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="date" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#4CAF50"
            strokeWidth={3}
            dot={{ r: 5, stroke: "#4CAF50", strokeWidth: 2, fill: "white" }}
            activeDot={{ r: 7 }}
            fill="url(#colorWeight)"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }