# 🏋️‍♂️ Fitness Tracker & 💰 Personal Budget App

개인 운동 기록과 가계부 관리를 함께 할 수 있는 통합 웹 애플리케이션입니다.  
운동, 체중, 1RM 기록은 물론, 가계부 기능까지 지원합니다.

## 🔧 기술 스택

- **Next.js** (App Router)
- **Firebase** (Authentication, Firestore)
- **MUI (Material UI)** – UI 컴포넌트
- **Recharts** – 데이터 시각화
- **Framer Motion** – 애니메이션
- **Date-fns** – 날짜 처리

---

## 📌 주요 기능

### 📅 대시보드

- 구글 캘린더 스타일 달력
- ✔ 기록된 날짜 표시
- 날짜 클릭 시 운동/체중 기록 확인 가능

### 🏋️ 운동 기록

- 운동 내용, 나의 기록, 후기 입력
- 운동 카테고리 선택 기능
- 일자별 기록 리스트 및 수정/삭제

### ⚖️ 체중 관리

- 날짜별 체중 입력
- 변화 추이 그래프 제공
- 수정/삭제 기능

### 🏆 챌린지

- 목표 reps 설정
- 날짜별 진행 상황 업데이트
- 진행 내역 리스트로 확인

### 💪 1RM 기록실

- 운동별 최고 기록 등록
- 날짜별 변화 추이 그래프
- 운동별 그래프 토글/수정/삭제

### 💰 가계부 (신규)

- 수입/지출 입력
- 카테고리, 카드사 선택
- 월별 필터링 & 통계 시각화 (원형/막대차트 예정)

---

## 📁 .env 설정 예시

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> `.env.local` 파일은 `.gitignore`에 꼭 포함되어 있어야 합니다.

---

## 🚀 실행 방법

```bash
npm install
npm run dev
```

---

## 📸 스크린샷 (원하면 여기에 이미지 추가!)

---

## 👨‍💻 개발자

- kuriring 님 👏  
- 피드백 및 기능 제안은 언제든지 환영입니다!
