# Shippy (쉬피)
AI 기반 사이드 프로젝트 팀 매칭 및 협업 플랫폼

##  소개
Shippy는 사이드 프로젝트 팀원을 쉽게 찾고, 나와 잘 맞는 사람과 함께 효율적으로 협업할 수 있도록 설계된 플랫폼입니다. 단순 모집 게시판이 아니라 **AI 추천 + 협업 기능 + 프로젝트 관리**까지 제공하는 통합 환경을 목표로 합니다.

---

##  주요 기능

### 1. AI 기반 맞춤형 추천 시스템
- 사용자 Bio를 LLM이 분석하여 **기술 스택·숙련도 자동 추출**
- 프로젝트 요구사항과 사용자 기술을 다양한 알고리즘으로 매칭  
  - 코사인 유사도  
  - 자카드 유사도  
  - 유클리드 유사도  
- 정량화된 매칭 점수를 제공하여 팀 빌딩 정확도 향상

---

### 2. 실시간 협업 팀룸 (Team Room)
- Socket.IO 기반 실시간 채팅
- AI 명령어 지원 챗봇
- 실시간 공유 마크다운 메모장
- WebRTC 화상 채팅 통합

---

### 3. 프로젝트 관리 및 필터링
- 기술 스택, 포지션, 지역/온라인 여부 등 다양한 필터 지원
- 프로젝트 탐색 및 참여를 쉽게 구성

---

##  기술 스택 (Tech Stack)

### Backend (packages/backend)
| 분야 | 기술 |
|------|------|
| 언어 | TypeScript |
| 프레임워크 | Express |
| DB | PostgreSQL + Prisma ORM |
| 인증 | Passport.js (JWT Strategy) |
| 실시간 통신 | Socket.IO |
| AI/LLM | Axios 기반 외부 API(Ollama 등) 연동 |
| 유틸리티 | Winston, http-status, Joi |

---

### Frontend (packages/frontend)
| 분야 | 기술 |
|------|------|
| 프레임워크 | Vue.js 3 (Composition API) |
| 언어 | TypeScript |
| 라우팅 | Vue Router 4 |
| 상태관리 | useAuth (Composable) |
| API 통신 | Axios, Socket.IO-client |
| 협업 기능 | markdown-it |

---

##  실행 방법 (Getting Started)

### 1. 필수 설치
- Node.js (v18 이상)
- PostgreSQL
- LLM 서비스(Ollama 등)

---

### 2. 환경 설정
루트 디렉토리에 `.env` 생성  
`packages/backend/.env.sample` 참고하여 값 입력

필요 변수 예시:
```
DATABASE_URL=postgresql://user:password@localhost:5432/shippy
JWT_SECRET=your_jwt_secret
LLM_API_URL=http://localhost:11434/api/generate
LLM_MODEL_NAME=gemma:2b
```

---

### 3. 설치 및 초기화
```bash
# 1. 전체 의존성 설치
npm install

# 2. 백엔드 설정
cd packages/backend
npx prisma migrate dev --name init
npm run seed   # 선택 사항
npm run dev:server  # http://localhost:3000
```

```bash
# 3. 프론트엔드 실행
cd ../frontend
npm run dev     # http://localhost:5173
```

---

##  테스트 실행

### Backend (Jest)
```bash
cd packages/backend
npm test
```

### Frontend (Vitest)
```bash
cd packages/frontend
npm test
```

---

##  프로젝트 구조
```
shippy/
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── api/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── middlewares/
│   │   │   ├── services/
│   │   │   ├── sockets/
│   │   │   └── utils/
│   │   ├── prisma/
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   ├── composables/
│       │   ├── pages/
│       │   └── router/
│       └── package.json
└── package.json
```

