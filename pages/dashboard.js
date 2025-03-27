import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  FaDumbbell,
  FaSignOutAlt,
  FaWeight,
  FaChartLine,
  FaTrophy,
  FaClipboardList,
  FaMoneyBillWave, // 💰 아이콘 추가
} from "react-icons/fa";
import CalendarTracker from "../components/CalendarTracker";
import "../styles/dashboard.css";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="dashboard">
      {/* ▶ Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-title">🏋️ Fitness</div>
        <nav className="nav">
          <NavItem icon={<FaDumbbell />} label="운동 기록 추가" onClick={() => router.push("/workout")} />
          <NavItem icon={<FaClipboardList />} label="운동 기록 보기" onClick={() => router.push("/workouts")} />
          <NavItem icon={<FaWeight />} label="체중 입력" onClick={() => router.push("/weight")} />
          <NavItem icon={<FaChartLine />} label="체중 변화 추이" onClick={() => router.push("/weight-trend")} />
          <NavItem icon={<FaTrophy />} label="챌린지" onClick={() => router.push("/challenge")} />
          <NavItem icon={<FaDumbbell />} label="1RM 기록실" onClick={() => router.push("/one-rep-max")} />
          <div className="sidebar-title">💰 Budget</div>
          <NavItem icon={<FaMoneyBillWave />} label="Budget" onClick={() => router.push("/BudgetDashboard")} /> {/* ✅ 추가 */}
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt /> 로그아웃
          </button>
        </nav>
      </aside>

      {/* ▶ Main */}
      <main className="main">
        <div className="container">
          <h1 className="title">🏠 프로필</h1>

          {user ? (
            <div className="user-card">
              <img
                src={user.photoURL}
                alt="User Profile"
                className="profile-img"
              />
              <h2 className="user-name">{user.displayName}</h2>
              <p className="user-email">{user.email}</p>
            </div>
          ) : (
            <p className="loading">사용자 정보를 불러오는 중...</p>
          )}

          {/* ✨ Calendar Section */}
          <section style={{ marginTop: "30px" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>
              📅 달력
            </h2>
            <div className="calendar-wrapper">
              <CalendarTracker />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, onClick }) {
  return (
    <button className="nav-item" onClick={onClick}>
      <span className="nav-icon">{icon}</span>
      <span>{label}</span>
    </button>
  );
}