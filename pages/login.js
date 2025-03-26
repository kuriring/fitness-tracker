import { auth, googleProvider } from "../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/router";
import styles from "../styles/Login.module.css"; // 스타일 파일 가져오기

export default function Login() {
  const router = useRouter();

  // Google 로그인 처리 함수
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard"); // 로그인 후 대시보드 이동
    } catch (error) {
      console.error("Google 로그인 오류:", error.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>로그인</h1>
        <p className={styles.description}>Google 계정으로 로그인하세요.</p>
        <button onClick={handleGoogleLogin} className={styles.button}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
            alt="Google Logo"
          />
          Google 로그인
        </button>
      </div>
    </div>
  );
}