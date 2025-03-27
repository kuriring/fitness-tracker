// scripts/initializeSettings.js
import { db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export const initializeGlobalSettings = async () => {
  const settingsRef = doc(db, "settings", "global");

  const initialData = {
    categories: ["식비", "교통", "쇼핑", "생활", "의료", "문화"],
    payments: ["현대", "국민", "BC", "카카오", "현금"],
  };

  try {
    await setDoc(settingsRef, initialData);
    console.log("✅ settings/global 문서가 성공적으로 생성되었습니다.");
  } catch (error) {
    console.error("❌ 생성 실패:", error);
  }
};