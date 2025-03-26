import { db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { wodContent, myRecord, review, date, category } = req.body;

      if (!wodContent || !myRecord || !review || !date || !category) {
        return res.status(400).json({ error: "모든 필드를 입력해야 합니다." });
      }

      // KST 기준으로 Timestamp 생성
      const [year, month, day] = date.split("-").map(Number);
      const kstDate = new Date(year, month - 1, day, 9); // UTC+9 기준

      await addDoc(collection(db, "workouts"), {
        wodContent,
        myRecord,
        review,
        date: Timestamp.fromDate(kstDate),
        category,
        createdAt: serverTimestamp(),
      });

      res.status(200).json({ message: "✅ 운동 기록이 성공적으로 추가되었습니다!" });
    } catch (error) {
      console.error("❌ Firestore에 운동 기록 추가 중 오류:", error);
      res.status(500).json({ error: "서버 오류로 인해 저장할 수 없습니다." });
    }
  } else {
    res.status(405).json({ error: "허용되지 않은 메서드입니다." });
  }
}