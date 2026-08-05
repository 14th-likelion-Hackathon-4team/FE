# 🤝 CONTRIBUTING

> 이 문서는 처음 프로젝트에 참여하는 팀원을 위한 가이드입니다.
> **git clone부터 PR 머지까지** 이 문서 하나로 끝낼 수 있도록 작성했습니다.

---

## 📌 목차

1. [사전 준비](#1-사전-준비)
2. [프로젝트 처음 세팅하기](#2-프로젝트-처음-세팅하기)
3. [개발 시작 전 매번 해야 하는 것](#3-개발-시작-전-매번-해야-하는-것)
4. [이슈 생성하기](#4-이슈-생성하기)
5. [브랜치 만들기](#5-브랜치-만들기)
6. [커밋하기 (gitmoji)](#6-커밋하기-gitmoji)
7. [PR 올리기](#7-pr-올리기)
8. [브랜치 흐름 정리](#8-브랜치-흐름-정리)
9. [코드 컨벤션](#9-코드-컨벤션)
10. [자주 쓰는 명령어 모음](#10-자주-쓰는-명령어-모음)

---

## 1. 사전 준비

> 처음 한 번만 하면 됩니다.

### Node.js 설치 확인

터미널(Mac: Terminal, Windows: Git Bash 또는 PowerShell)을 열고 아래 명령어를 입력하세요.

```bash
node -v
```

현재 프로젝트의 Vite 8은 Node.js `^20.19.0` 또는 `>=22.12.0`이 필요합니다.
버전 번호(예: `v22.19.0`)가 나오면 요구 버전을 만족하는지 확인하세요.
안 나오거나 요구 버전보다 낮으면 [https://nodejs.org](https://nodejs.org) 에서 LTS 버전을 설치하세요.

### Git 설치 확인

```bash
git -v
```

버전 번호가 나오면 설치된 것입니다.
안 나오면 [https://git-scm.com](https://git-scm.com) 에서 설치하세요.

---

## 2. 프로젝트 처음 세팅하기

> 처음 한 번만 하면 됩니다.

### 1단계 — 레포지토리 클론

GitHub에서 4팀 프론트엔드 프로젝트를 내 컴퓨터로 복사합니다.

```bash
git clone https://github.com/14th-likelion-Hackathon-4team/FE.git
```

### 2단계 — 프로젝트 폴더로 이동

```bash
cd FE
```

### 3단계 — 패키지 설치

`node_modules` 폴더(라이브러리 모음)를 생성합니다.
git에는 올라가있지 않기 때문에 반드시 직접 설치해야 합니다.

```bash
npm install
```

> 설치가 완료되면 `node_modules` 폴더가 생깁니다.

### 4단계 — 환경변수 확인

현재 초기 세팅에는 필수 환경변수가 없으며 `.env.example` 파일도 사용하지 않습니다.
따라서 프로젝트 실행을 위해 별도의 `.env` 파일을 만들 필요가 없습니다.

추후 API 연동 등으로 환경변수가 추가되면 팀에서 제공하는 `.env.example`을 기준으로 `.env`를 생성하고 실제 값을 입력합니다.

> ⚠️ 실제 값이 들어간 `.env` 파일은 절대 git에 올리면 안 됩니다. (`.gitignore`에 등록되어 있습니다.)

### 5단계 — 개발 서버 실행

```bash
npm run dev
```

터미널에 아래와 같이 뜨면 성공입니다!

```
  VITE v8.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

브라우저에서 `http://localhost:5173` 으로 접속하면 프로젝트가 보입니다.

### 현재 프로젝트 구조

아래는 현재 초기 라우트에 연결된 프론트엔드 구조입니다.

```text
public/
└─ assets/
   └─ navigation/          # Figma 하단 내비게이션 에셋

src/
├─ components/
│  ├─ BottomNavigation/    # 공통 하단 내비게이션
│  └─ PagePlaceholder/     # 초기 페이지 placeholder
├─ context/
│  └─ AuthContext.jsx      # 기존 인증 context (현재 라우트 보호에는 미사용)
├─ layouts/
│  ├─ HomeLayout.jsx       # 홈·루틴·리포트·마이페이지 공통 레이아웃
│  └─ PublicLayout.jsx     # 로그인·회원가입 공통 레이아웃
├─ pages/
│  ├─ LoginPage/
│  ├─ Mainpage/
│  ├─ Mypage/
│  ├─ ReportPage/
│  ├─ RoutinePage/
│  └─ SignupPage/
└─ routes/
   ├─ pageRoutes.jsx       # /, /login, /signup, /routines, /reports, /mypage
   └─ routes.js            # 페이지 lazy import 모음
```

---

## 3. 개발 시작 전 매번 해야 하는 것

> 매번 새로운 작업을 시작할 때마다 합니다.

### develop 브랜치 최신 상태로 업데이트

다른 팀원이 작업한 내용을 내 컴퓨터에 반영합니다.
**반드시 develop 브랜치에서 시작하세요.**

```bash
git checkout develop      # develop 브랜치로 이동
git pull origin develop   # 최신 내용 가져오기
```

개발 서버가 꺼져 있다면 다시 실행하세요.

```bash
npm run dev
```

### 작업 시 주의사항

- `src/routes/pageRoutes.jsx`를 수정해야 할 때는 **반드시 카톡방에 먼저 공유**한 후 작업하세요.
- API URL, token 등 민감한 정보는 코드에 직접 작성하지 말고 `.env`에서 관리하세요.
- `.env`는 절대 커밋하지 마세요.

---

## 4. 이슈 생성하기

> 모든 작업은 반드시 이슈로 시작합니다.

1. GitHub 레포 → `Issues` 탭 → `New Issue` 클릭
2. 현재 제공되는 `ISSUE` 템플릿을 선택
3. 제목 형식: `[분류] 작업 요약`
   - 예시: `[Feat] 메인페이지 개발`
   - 예시: `[Fix] 로그인 버튼 클릭 안 되는 버그 수정`
4. 내용 작성 후 `Submit new issue` 클릭
5. 생성된 이슈 번호 확인 (예: `#3`) → 브랜치명에 사용합니다

---

## 5. 브랜치 만들기

> 이슈 생성 후 브랜치를 만듭니다.

### 브랜치 규칙

```
브랜치종류/#이슈번호/상세기능
```

| 브랜치 종류 | 언제 사용          |
| ----------- | ------------------ |
| `feat`      | 새로운 기능 개발   |
| `fix`       | 버그 수정          |
| `design`    | UI / CSS 수정      |
| `refactor`  | 코드 리팩토링      |
| `init`      | 프로젝트 초기 세팅 |

예시:

```bash
feat/#3/mainPage
fix/#7/loginButton
design/#10/myPage
```

### 브랜치 생성 및 이동 명령어

```bash
git checkout -b 브랜치명
```

예시:

```bash
git checkout -b feat/#3/mainPage
```

> `git checkout -b` 는 브랜치를 만들면서 동시에 그 브랜치로 이동하는 명령어입니다.

현재 어떤 브랜치에 있는지 확인하려면:

```bash
git branch
```

현재 브랜치 앞에 `*` 표시가 됩니다.

---

## 6. 커밋하기 (gitmoji)

> 이 프로젝트의 커밋은 **반드시 gitmoji를 사용**합니다.
> 일반 `git commit -m` 대신 `npx gitmoji -c`를 실행하세요.

### 1단계 — 코드 검사

커밋하기 전에 lint와 production build가 정상적으로 완료되는지 확인합니다.

```bash
npm run lint
npm run build
```

오류가 나오면 해결한 뒤 커밋을 진행하세요.

### 2단계 — 변경된 파일 확인

```bash
git status
```

이번 작업과 관련된 파일만 포함되어 있는지 확인하세요. `.env`, 불필요한 `console.log`, 개인 설정 파일이 포함되지 않았는지도 함께 확인합니다.

### 3단계 — 파일 스테이징

커밋할 파일을 선택합니다.

```bash
# 전체 파일 한번에 추가
git add .

# 특정 파일만 추가
git add src/pages/Mainpage/MainPage.jsx
```

가능하면 특정 파일을 골라 스테이징하고, 다시 `git status`로 커밋 범위를 확인하세요.

### 4단계 — gitmoji로 커밋

아래 명령어를 실행합니다.

```bash
npx gitmoji -c
```

그러면 아래 순서로 입력창이 나타납니다.

#### ① 이모지 선택

방향키로 이동하거나 검색어를 입력해서 선택합니다.

| 이모지 | 태그     | 언제 사용                       |
| ------ | -------- | ------------------------------- |
| ✨     | Feat     | 새로운 기능 추가                |
| 🐛     | Fix      | 버그 수정                       |
| 💄     | Design   | UI / CSS 수정                   |
| ♻️     | Refactor | 코드 리팩토링                   |
| 💡     | Add      | 파일 추가 (이미지 등)           |
| 🔥     | Del      | 파일 삭제                       |
| 🚚     | Mod      | 파일 / 폴더 이동 또는 이름 변경 |
| 🎉     | Init     | 프로젝트 초기 세팅              |
| ✏️     | Typo     | 오타 수정                       |

#### ② 커밋 제목 입력

```
Feat : 메인페이지 개발 (#3)
```

형식: `태그 : 작업 내용 (#이슈번호)`

- 태그는 선택한 이모지의 작업 유형과 일치시킵니다.
- 작업 내용을 한 문장으로 간결하게 작성합니다.
- 마지막에 관련 이슈 번호를 반드시 붙입니다.
- gitmoji가 선택한 이모지를 제목 앞에 자동으로 붙입니다.

최종 커밋은 다음과 같은 형태로 생성됩니다.

```text
✨ Feat : 메인페이지 개발 (#3)
```

#### ③ 커밋 본문 입력

필요한 경우 변경 이유나 세부 작업 내용을 간단히 작성합니다. 추가 설명이 필요 없다면 비워도 됩니다.

커밋이 정상적으로 생성됐는지 확인하세요.

```bash
git log -1 --oneline
```

### 5단계 — 원격 저장소에 push

```bash
git push -u origin 브랜치명
```

예시:

```bash
git push -u origin feat/#3/mainPage
```

> 같은 브랜치에서 두 번째 push부터는 `git push`만 실행해도 됩니다.

---

## 7. PR 올리기

### 1단계 — GitHub에서 PR 생성

1. GitHub 레포 페이지로 이동
2. 상단에 `Compare & pull request` 버튼 클릭 (push 후 자동으로 뜹니다)
3. **base 브랜치가 `develop`인지 반드시 확인** (`main`으로 올리지 않습니다.)
4. PR 템플릿에 맞게 내용 작성
5. 우측에서 `Assignees` → 본인 선택
6. `Labels` → 작업 유형 선택 (Feat / Fix / Design)
7. `Create pull request` 클릭

### 2단계 — 카톡방에 PR 링크 공유

PR 생성 후 반드시 카톡방에 PR 링크와 함께 리뷰 요청을 합니다.

### 3단계 — 머지

코드 리뷰 완료 후 **PR 올린 본인이 직접 머지**합니다.

---

## 8. 브랜치 흐름 정리

```text
feat/#N/기능명  →  develop  →  (배포 시) main
```

- 모든 작업은 최신 `develop`에서 새 브랜치를 만들어 시작합니다.
- 기능·수정 브랜치의 PR은 모두 `develop`을 대상으로 올립니다.
- `main`은 배포할 때만 `develop → main`으로 머지합니다.
- `main`은 항상 배포 가능한 안정적인 상태를 유지합니다.
- 머지가 끝난 작업 브랜치는 GitHub와 로컬에서 정리합니다.

> ⚠️ `src/routes/pageRoutes.jsx` 수정이 필요할 때는 충돌 방지를 위해 반드시 카톡방에 먼저 공유하세요.

---

## 9. 코드 컨벤션

### 네이밍 규칙

| 대상              | 규칙            | 예시                          |
| ----------------- | --------------- | ----------------------------- |
| 변수명            | camelCase       | `userName`, `isLoggedIn`      |
| 함수명            | camelCase       | `handleSubmit`, `getUserData` |
| 컴포넌트명        | PascalCase      | `MainPage`, `UserCard`        |
| 파일명 (컴포넌트) | PascalCase      | `MainPage.jsx`                |
| 파일명 (기타)     | camelCase       | `authService.js`              |
| CSS 클래스명      | kebab-case 허용 | `user-card`                   |

### 주요 규칙

- 변수명에 언더바(`_`) 사용 금지 (CSS 클래스명 제외)
- `==` 대신 `===` 사용 권장
- 함수는 화살표 함수 사용 권장

### import 순서

```jsx
// 1. 외부 라이브러리
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. 내부 컴포넌트 / 파일
import Button from '@/components/Button';
import { login } from '@/services/authService';
```

---

## 10. 자주 쓰는 명령어 모음

```bash
# 현재 브랜치 확인
git branch

# 브랜치 이동
git checkout 브랜치명

# 브랜치 생성 + 이동
git checkout -b 브랜치명

# 최신 내용 가져오기
git pull origin develop

# 변경 파일 확인
git status

# 전체 파일 스테이징
git add .

# gitmoji 커밋
npx gitmoji -c

# 최초 push 및 upstream 설정
git push -u origin 브랜치명

# 같은 브랜치에서 두 번째 이후 push
git push

# 개발 서버 실행
npm run dev

# ESLint 검사
npm run lint

# production build 검사
npm run build

# 패키지 설치
npm install
```

---

> 궁금한 점은 카톡방에 편하게 질문하세요! 😊
