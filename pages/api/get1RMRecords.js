// pages/api/get1RMRecords.js

import { db } from "../../lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "허용되지 않은 메서드입니다." });
  }

  try {
    const recordsRef = query(collection(db, "oneRepMax"), orderBy("date", "desc"));
    const snapshot = await getDocs(recordsRef);

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(data);
  } catch (err) {
    console.error("❌ 1RM 기록 불러오기 실패:", err);
    res.status(500).json({ error: "서버 오류로 데이터를 가져올 수 없습니다." });
  }
}