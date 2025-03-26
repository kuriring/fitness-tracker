// pages/api/add1RM.js

import { db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "허용되지 않은 메서드입니다." });
  }

  const { name, weight, date } = req.body;

  if (!name || !weight || !date) {
    return res.status(400).json({ error: "❌ 모든 필드를 입력해주세요." });
  }

  try {
    await addDoc(collection(db, "oneRepMax"), {
      name,
      weight,
      date,
      createdAt: serverTimestamp(),
    });

    res.status(200).json({ message: "✅ 기록이 추가되었습니다." });
  } catch (err) {
    console.error("❌ 추가 실패:", err);
    res.status(500).json({ error: "서버 오류로 인해 추가할 수 없습니다." });
  }
}