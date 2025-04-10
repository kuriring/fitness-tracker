import Link from "next/link";

export default function SettingsHome() {
  return (
    <div style={{ maxWidth: "500px", margin: "40px auto", padding: "20px" }}>
      <h2>⚙️ 설정</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li style={{ marginBottom: "12px" }}>
          <Link href="/settings/categories">📂 카테고리 관리</Link>
        </li>
        <li>
          <Link href="/settings/payments">💳 결제 수단 관리</Link>
        </li>
      </ul>
    </div>
  );
}