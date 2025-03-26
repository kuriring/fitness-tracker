// pages/api/updateWoD.js

import { db } from "../../lib/firebase";
import { doc, updateDoc, Timestamp } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method === "PUT") {
    try {
      const { id, wodContent, myRecord, review, date, category } = req.body;

      if (!id || !wodContent || !myRecord || !review || !date || !category) {
        return res.status(400).json({ error: "❌ 모든 필드를 입력해주세요." });
      }

      // ✅ KST 날짜를 Firestore Timestamp로 변환
      const [year, month, day] = date.split("-").map(Number);
      const kstDate = new Date(year, month - 1, day, 9); // UTC+9 09:00 기준
      const dateTimestamp = Timestamp.fromDate(kstDate);

      const workoutRef = doc(db, "workouts", id); // ❗️이 줄이 누락됐었음!

      await updateDoc(workoutRef, {
        wodContent,
        myRecord,
        review,
        date: dateTimestamp,
        category,
      });

      res.status(200).json({ message: "✅ 운동 기록이 수정되었습니다!" });
    } catch (error) {
      console.error("❌ 운동 기록 수정 오류:", error);
      res.status(500).json({ error: "❌ 서버 오류로 인해 수정할 수 없습니다." });
    }
  } else {
    res.status(405).json({ error: "허용되지 않은 메서드입니다." });
  }
}