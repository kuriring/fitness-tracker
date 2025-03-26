// pages/api/update1RM.js

import { db } from "../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "허용되지 않은 메서드입니다." });
  }

  const { id, name, weight, date } = req.body;

  if (!id || !name || !weight || !date) {
    return res.status(400).json({ error: "❌ 모든 필드를 입력해야 합니다." });
  }

  try {
    const ref = doc(db, "oneRepMax", id);
    await updateDoc(ref, { name, weight, date });

    res.status(200).json({ message: "✅ 수정 완료" });
  } catch (err) {
    console.error("❌ 1RM 수정 오류:", err);
    res.status(500).json({ error: "서버 오류로 수정할 수 없습니다." });
  }
}