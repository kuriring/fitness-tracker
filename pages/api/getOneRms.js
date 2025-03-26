import { db } from "../../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const q = query(collection(db, "oneRMs"), orderBy("date", "asc"));
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      res.status(200).json(results);
    } catch (error) {
      console.error("❌ 1RM 가져오기 오류:", error);
      res.status(500).json({ error: "서버 오류" });
    }
  } else {
    res.status(405).json({ error: "허용되지 않은 메서드" });
  }
}