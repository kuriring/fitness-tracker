import { db } from "../../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const workoutQuery = query(collection(db, "workouts"), orderBy("date", "desc"));
      const snapshot = await getDocs(workoutQuery);

      const workouts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json(workouts);
    } catch (error) {
      console.error("❌ Firestore에서 운동 기록 불러오기 오류:", error);
      res.status(500).json({ error: "서버 오류로 인해 데이터를 불러올 수 없습니다." });
    }
  } else {
    res.status(405).json({ error: "허용되지 않은 메서드입니다." });
  }
}