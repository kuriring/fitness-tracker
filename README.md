# 🏋️‍♂️ Fitness Tracker

Firebase + Next.js 기반의 개인 피트니스 / 식단 / 가계부 기록 앱입니다.

## 📦 기능 요약

### ✅ 운동 기록
- 날짜별 운동 기록 추가/수정/삭제
- 운동 카테고리 및 반복 횟수 입력
- 달력 기반 기록 확인 (✔️ 표시)

### ✅ 체중 추이 분석
- 체중 입력 및 히스토리 보기
- 최근 7일~1년 필터링 및 평균/최신 체중 표시
- 리차트 기반 추이 시각화

### ✅ 1RM 기록실
- 운동별 1RM 기록, 추이, 그래프 토글
- 운동별 컬러/아이콘 커스터마이징

### ✅ 가계부
- 수입/지출 내역 저장 (날짜, 금액, 카테고리, 결제 수단, 메모)
- 카테고리/결제수단 관리 기능
- 월별 통계 및 차트 시각화

### ✅ 식단 기록
- 끼니별 음식 추가 (칼로리, 탄/단/지 포함)
- 날짜별 기록 + 총합 자동 계산
- 메모 기능 포함

---

## 🔧 사용 기술 스택

- **Next.js** + **React**
- **Firebase (Auth, Firestore)**
- **MUI (Material UI)**
- **Recharts** (그래프 시각화)
- **Git & GitHub**

---

## 🚀 실행 방법

```bash
git clone https://github.com/kuriring/fitness-tracker.git
cd fitness-tracker
npm install
npm run dev
```

---

## 📁 환경 변수 설정

`.env.local` 파일을 생성하고 아래 내용을 추가하세요:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## ✨ TODO

- [ ] 다크 모드 지원
- [ ] 모바일 최적화

---

## 👤 개발자

- GitHub: [kuriring](https://github.com/kuriring)
- Made with ❤️ by Kuriring
