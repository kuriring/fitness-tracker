import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    console.log("📌 챌린지 데이터를 불러오는 중...");
    const querySnapshot = await getDocs(collection(db, "challenges"));
    const challenges = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log("📌 불러온 챌린지 데이터:", challenges);
    res.status(200).json(challenges);
  } catch (error) {
    console.error("❌ 챌린지 불러오기 오류:", error);
    res.status(500).json({ error: "서버 오류로 인해 챌린지를 불러올 수 없습니다." });
  }
}