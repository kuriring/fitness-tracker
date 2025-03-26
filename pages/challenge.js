import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Challenge() {
  const [challenges, setChallenges] = useState([]);
  const [newChallenge, setNewChallenge] = useState("");
  const [startReps, setStartReps] = useState("");
  const [startDate, setStartDate] = useState("");
  const [progress, setProgress] = useState({});
  const [newProgress, setNewProgress] = useState({});
  const [updateDate, setUpdateDate] = useState({});
  const [expanded, setExpanded] = useState({}); // ✅ 펼침 상태 저장
  const router = useRouter();

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await fetch("/api/getChallenges");
        const data = await response.json();
        setChallenges(data);
        const progressMap = {};
        const expandedMap = {};
        data.forEach((c) => {
          progressMap[c.id] = Array.isArray(c.progress) ? c.progress : [];
          expandedMap[c.id] = false;
        });
        setProgress(progressMap);
        setExpanded(expandedMap);
      } catch (err) {
        console.error("❌ 챌린지 불러오기 오류:", err);
      }
    };

    fetchChallenges();
  }, []);

  const toggleExpanded = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddChallenge = async () => {
    if (!newChallenge || !startReps || !startDate) {
      alert("❌ 모든 항목을 입력하세요!");
      return;
    }

    try {
      const res = await fetch("/api/addChallenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newChallenge, startReps, startDate, progress: [] }),
      });

      const data = await res.json();
      if (res.ok) {
        const newId = data.id;
        setChallenges([...challenges, { id: newId, name: newChallenge, startReps, startDate, progress: [] }]);
        setProgress({ ...progress, [newId]: [] });
        setExpanded({ ...expanded, [newId]: false });
        setNewChallenge(""); setStartReps(""); setStartDate("");
      } else alert(data.error);
    } catch (err) {
      console.error("❌ 추가 실패:", err);
    }
  };

  const updateProgress = async (challengeId) => {
    const reps = newProgress[challengeId];
    const date = updateDate[challengeId];
    if (!reps || !date) {
      alert("❌ 날짜와 Reps를 입력하세요!");
      return;
    }

    const updated = [...(progress[challengeId] || []), { date, reps }];
    setProgress({ ...progress, [challengeId]: updated });

    try {
      await fetch("/api/updateChallengeProgress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: challengeId, progress: updated }),
      });
      setNewProgress({ ...newProgress, [challengeId]: "" });
      setUpdateDate({ ...updateDate, [challengeId]: "" });
    } catch (err) {
      console.error("❌ 업데이트 실패:", err);
    }
  };

  const deleteProgressEntry = async (challengeId, index) => {
    const updated = progress[challengeId].filter((_, i) => i !== index);
    setProgress({ ...progress, [challengeId]: updated });

    try {
      await fetch("/api/updateChallengeProgress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: challengeId, progress: updated }),
      });
    } catch (err) {
      console.error("❌ 삭제 실패:", err);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <h1 style={{ textAlign: "center", fontSize: "2rem", marginBottom: "20px" }}>🔥 챌린지 관리</h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            padding: "10px 20px",
            background: "#ff9800",
            color: "white",
            borderRadius: "6px",
            marginBottom: "10px",
            cursor: "pointer",
          }}
        >
          ⬅ 대시보드로 이동
        </button>
      </div>

      {/* 챌린지 추가 */}
      <div style={{ border: "1px solid #ccc", borderRadius: "10px", padding: "20px", marginBottom: "30px", background: "#fafafa" }}>
        <h2>🆕 새로운 챌린지 추가</h2>
        <div style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
          <input type="text" placeholder="챌린지 이름" value={newChallenge} onChange={(e) => setNewChallenge(e.target.value)} />
          <input type="number" placeholder="시작 Reps" value={startReps} onChange={(e) => setStartReps(e.target.value)} />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <button onClick={handleAddChallenge} style={{ background: "#4CAF50", color: "white", padding: "10px", borderRadius: "6px" }}>
            추가하기
          </button>
        </div>
      </div>

      {/* 챌린지 목록 */}
      <h2 style={{ marginBottom: "10px" }}>📌 현재 챌린지</h2>
      {challenges.length === 0 ? (
        <p>진행 중인 챌린지가 없습니다.</p>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {challenges.map((c) => (
            <div key={c.id} style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "10px", background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>{c.name}</h3>
                <button
                  onClick={() => toggleExpanded(c.id)}
                  style={{
                    padding: "5px 10px",
                    background: "#2196F3",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {expanded[c.id] ? "접기" : "펼치기"}
                </button>
              </div>
              <p>🔥 시작 Reps: {c.startReps}</p>
              <p>📅 시작일: {c.startDate}</p>

              {expanded[c.id] && (
                <>
                  <div style={{ marginTop: "10px", display: "grid", gap: "8px" }}>
                    <input type="date" value={updateDate[c.id] || ""} onChange={(e) => setUpdateDate({ ...updateDate, [c.id]: e.target.value })} />
                    <input type="number" placeholder="Reps" value={newProgress[c.id] || ""} onChange={(e) => setNewProgress({ ...newProgress, [c.id]: e.target.value })} />
                    <button onClick={() => updateProgress(c.id)} style={{ padding: "6px", background: "#4CAF50", color: "white", borderRadius: "4px" }}>
                      업데이트
                    </button>
                  </div>

                  <ul style={{ marginTop: "15px", paddingLeft: "15px" }}>
                    {(progress[c.id] || []).map((entry, i) => (
                      <li key={i} style={{ marginBottom: "6px" }}>
                        {entry.date}: {entry.reps} reps
                        <button onClick={() => deleteProgressEntry(c.id, i)} style={{ marginLeft: "10px", color: "white", background: "#f44336", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}>
                          삭제
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}