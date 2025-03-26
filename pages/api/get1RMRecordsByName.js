import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { name } = req.query;

      if (!name) {
        return res.status(400).json({ error: "운동 이름(name)이 필요합니다." });
      }

      const q = query(
        collection(db, "onerm"),
        where("name", "==", name),
        orderBy("date", "asc")
      );
      const snapshot = await getDocs(q);

      const records = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json(records);
    } catch (err) {
      console.error("❌ 1RM 기록 불러오기 실패:", err);
      res.status(500).json({ error: "서버 오류로 인해 데이터를 불러올 수 없습니다." });
    }
  } else {
    res.status(405).json({ error: "허용되지 않은 메서드입니다." });
  }
}