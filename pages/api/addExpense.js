import { db } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, type, category, payment, memo, date } = req.body;

    if (!amount || !type || !category || !payment || !date) {
      return res.status(400).json({ error: "필수 항목이 누락되었습니다." });
    }

    const docRef = await addDoc(collection(db, "expenses"), {
      amount: parseFloat(amount),
      type,
      category,
      payment,
      memo,
      date: new Date(date), // ✅ 클라이언트가 보낸 날짜를 사용
    });

    res.status(200).json({ id: docRef.id });
  } catch (error) {
    console.error("❌ 지출 추가 오류:", error);
    res.status(500).json({ error: "서버 오류 발생" });
  }
}