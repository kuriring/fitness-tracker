import { db } from "../../lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: "❌ ID가 제공되지 않았습니다." });
      }

      await deleteDoc(doc(db, "oneRepMax", id));

      res.status(200).json({ message: "✅ 1RM 기록이 삭제되었습니다." });
    } catch (error) {
      console.error("❌ 삭제 중 오류:", error);
      res.status(500).json({ error: "서버 오류로 인해 삭제할 수 없습니다." });
    }
  } else {
    res.status(405).json({ error: "허용되지 않은 메서드입니다." });
  }
}