// pages/api/deleteWoD.js
import { db } from "../../lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "❌ 삭제할 ID가 없습니다." });
    }

    try {
      await deleteDoc(doc(db, "workouts", id));
      res.status(200).json({ message: "✅ 운동 기록이 삭제되었습니다!" });
    } catch (error) {
      console.error("❌ 삭제 중 오류 발생:", error);
      res.status(500).json({ error: "서버 오류로 삭제할 수 없습니다." });
    }
  } else {
    res.status(405).json({ error: "허용되지 않은 메서드입니다." });
  }
}