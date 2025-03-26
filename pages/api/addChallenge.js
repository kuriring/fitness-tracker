import { db } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { name, startReps, startDate } = req.body;

  if (!name || !startReps || !startDate) {
    return res.status(400).json({ error: "챌린지 이름, 시작 Reps, 시작일을 입력하세요!" });
  }

  try {
    console.log("📌 챌린지 추가 중...");
    const docRef = await addDoc(collection(db, "challenges"), {
      name,
      startReps,
      startDate,
    });

    console.log("📌 추가된 챌린지 ID:", docRef.id);
    res.status(201).json({ id: docRef.id, name, startReps, startDate });
  } catch (error) {
    console.error("❌ 챌린지 추가 오류:", error);
    res.status(500).json({ error: "서버 오류로 인해 챌린지를 추가할 수 없습니다." });
  }
}