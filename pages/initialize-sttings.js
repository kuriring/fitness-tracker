// initStructuredCategories.js
const admin = require("firebase-admin");
const fs = require("fs");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function initStructuredCategories() {
  const settingsRef = db.doc("settings/global");

  const newCategoryData = {
    categories: {
      income: [
        { name: "월급", icon: "💼", color: "#4caf50" },
        { name: "보너스", icon: "🎁", color: "#81c784" },
        { name: "이자소득", icon: "💰", color: "#aed581" },
        { name: "기타", icon: "➕", color: "#9ccc65" },
      ],
      expense: [
        { name: "식비", icon: "🍔", color: "#f44336" },
        { name: "교통비", icon: "🚌", color: "#ff9800" },
        { name: "쇼핑", icon: "🛍️", color: "#e91e63" },
        { name: "의료비", icon: "💊", color: "#9c27b0" },
        { name: "문화생활", icon: "🎮", color: "#3f51b5" },
        { name: "기타", icon: "❓", color: "#607d8b" },
      ],
    },
  };

  try {
    const snapshot = await settingsRef.get();
    const backupFile = `settings-backup-${new Date().toISOString()}.json`;

    if (snapshot.exists) {
      fs.writeFileSync(backupFile, JSON.stringify(snapshot.data(), null, 2));
      console.log(`✅ 백업 완료 → ${backupFile}`);
    }

    await settingsRef.set(newCategoryData, { merge: true });
    console.log("✅ 카테고리 구조 초기화 완료!");
  } catch (err) {
    console.error("❌ 오류 발생:", err);
  }
}

initStructuredCategories();