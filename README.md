# AI Project Portal

GenAI Portal은 AI 프로젝트 환경을 효율적으로 관리하기 위한 웹 플랫폼입니다. AWS Bedrock Claude 3.5 Sonnet과 통합되어 있으며, 역할 기반 접근 제어를 통해 안전하고 체계적인 프로젝트 관리를 제공합니다.

## 🚀 주요 기능

### 🔐 역할 기반 접근 제어
- **ADMIN**: 모든 기능 접근 가능, 프로젝트 승인 권한
- **MASTER**: 프로젝트 신청, 검색, 승인 권한
- **DEVELOPER**: 프로젝트 신청 및 개인 프로젝트 관리

### 📋 핵심 기능
- **과제(검증)환경 신청**: 새로운 AI 프로젝트 환경 신청
- **과제(검증)환경 검색**: 운영 중인 프로젝트 환경 검색 및 필터링
- **과제(검증)환경 승인**: 관리자의 프로젝트 검토 및 승인
- **AI Playground**: AWS Bedrock Claude 3.5 Sonnet을 활용한 AI 채팅 인터페이스
- **프로젝트 현황 관리**: 개인별 프로젝트 신청 현황 추적

## 🛠 기술 스택

### Frontend
- **Next.js 14**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안전성을 위한 정적 타입 언어
- **Tailwind CSS**: 유틸리티 우선 CSS 프레임워크
- **React Hooks**: 상태 관리 및 생명주기 관리

### Backend Integration
- **AWS Bedrock**: Claude 3.5 Sonnet AI 모델 통합
- **RESTful API**: 백엔드 서버와의 통신 (localhost:4000)

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
# 또는
yarn install
```

### 2. 개발 서버 실행
```bash
npm run dev
# 또는
yarn dev
```

### 3. 브라우저에서 확인
[http://localhost:3000](http://localhost:3000)에서 애플리케이션을 확인할 수 있습니다.

## 🔧 환경 설정

### 백엔드 서버 연동
- 백엔드 서버가 `localhost:4000`에서 실행되어야 합니다
- AWS Bedrock 인증 정보가 백엔드에 설정되어야 합니다

### 환경 변수
필요한 환경 변수들을 `.env.local` 파일에 설정하세요:
```bash
# 백엔드 API URL (선택사항, 기본값: http://localhost:4000)
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 메인 홈페이지
│   ├── layout.tsx         # 루트 레이아웃
│   ├── globals.css        # 글로벌 스타일
│   ├── login/             # 로그인 페이지
│   ├── playground/        # AI Playground
│   ├── project/           # 프로젝트 관련 페이지
│   │   ├── register/      # 프로젝트 신청
│   │   ├── search/        # 프로젝트 검색
│   │   └── approve/       # 프로젝트 승인
│   └── my-projects/       # 개인 프로젝트 현황
├── components/            # 재사용 가능한 컴포넌트
│   └── Navigation.tsx     # 네비게이션 컴포넌트
└── public/               # 정적 파일
    └── manual.txt        # 사용자 매뉴얼
```

## 🎯 사용법

### 1. 로그인
- 시스템에 로그인하여 JWT 토큰을 받습니다
- 역할에 따라 접근 가능한 기능이 결정됩니다

### 2. 프로젝트 신청 (DEVELOPER, MASTER)
- "과제(검증)환경 신청" 메뉴에서 새 프로젝트를 신청합니다
- 필요한 리소스와 기간을 지정할 수 있습니다

### 3. 프로젝트 검색 (ADMIN, MASTER)
- "과제(검증)환경 검색" 메뉴에서 기존 프로젝트를 검색합니다
- 상태, 담당자, 프로젝트명으로 필터링 가능합니다

### 4. AI Playground
- Claude 3.5 Sonnet과 실시간 채팅이 가능합니다
- 대화 기록이 유지되며 스크롤 자동 이동을 지원합니다

## 🔗 관련 링크

- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [AWS Bedrock 문서](https://docs.aws.amazon.com/bedrock/)

## 📝 라이선스

이 프로젝트는 내부 사용을 위한 프로젝트입니다.

## 🤝 기여

프로젝트 개선 사항이나 버그 리포트는 시스템 관리자에게 문의해주세요.

---

**버전**: 1.0.0  
**최종 수정일**: 2024-12-13
