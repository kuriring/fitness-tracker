import { db } from "../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { id, progress } = req.body;

  if (!id || !progress) {
    return res.status(400).json({ error: "챌린지 ID와 진행 상황을 입력하세요!" });
  }

  try {
    console.log("📌 챌린지 진행 상황 업데이트 중...");
    const challengeRef = doc(db, "challenges", id);
    await updateDoc(challengeRef, { progress });

    console.log("📌 진행 상황 업데이트 완료");
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ 진행 상황 업데이트 오류:", error);
    res.status(500).json({ error: "서버 오류로 인해 진행 상황을 업데이트할 수 없습니다." });
  }
}