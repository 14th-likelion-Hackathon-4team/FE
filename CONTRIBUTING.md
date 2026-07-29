# 🤝 CONTRIBUTING

> 이 문서는 처음 프로젝트에 참여하는 팀원을 위한 가이드입니다.
> **git clone부터 첫 커밋까지** 이 문서 하나로 끝낼 수 있도록 작성했습니다.

---

## 📌 목차

1. [사전 준비](#1-사전-준비)
2. [프로젝트 처음 세팅하기](#2-프로젝트-처음-세팅하기)
3. [개발 시작 전 매번 해야 하는 것](#3-개발-시작-전-매번-해야-하는-것)
4. [이슈 생성하기](#4-이슈-생성하기)
5. [브랜치 만들기](#5-브랜치-만들기)
6. [개발하기](#6-개발하기)
7. [커밋하기](#7-커밋하기)
8. [PR 올리기](#8-pr-올리기)
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

버전 번호(예: `v20.11.0`)가 나오면 설치된 것입니다.
안 나오면 [https://nodejs.org](https://nodejs.org) 에서 LTS 버전을 설치하세요.

### Git 설치 확인

```bash
git -v
```

버전 번호가 나오면 설치된 것입니다.
안 나오면 [https://git-scm.com](https://git-scm.com) 에서 설치하세요.

### gitmoji 설치 (커밋 이모지 도구, 최초 1회)

```bash
npm i -g gitmoji-cli
```

설치 확인:

```bash
gitmoji -v
```

---

## 2. 프로젝트 처음 세팅하기

> 처음 한 번만 하면 됩니다.

### 1단계 — 레포지토리 클론

GitHub에서 프로젝트를 내 컴퓨터로 복사해오는 작업입니다.

```bash
git clone 레포지토리_주소
```

> 레포지토리 주소는 GitHub 레포 페이지에서 `Code` 버튼 클릭 → HTTPS 주소를 복사하세요.

예시:

```bash
git clone https://github.com/팀명/프로젝트명.git
```

### 2단계 — 프로젝트 폴더로 이동

```bash
cd 프로젝트명
```

### 3단계 — 패키지 설치

`node_modules` 폴더(라이브러리 모음)를 생성합니다.
git에는 올라가있지 않기 때문에 반드시 직접 설치해야 합니다.

```bash
npm install
```

> 설치가 완료되면 `node_modules` 폴더가 생깁니다.

### 4단계 — 환경변수 파일 생성

프로젝트 루트에 `.env` 파일을 직접 만들고, 팀원에게 받은 실제 값을 입력합니다.

```bash
# .env 파일을 직접 만들거나 아래 명령어로 생성
cp .env.example .env
```

그 다음 `.env` 파일을 열어서 실제 값을 채워넣으세요.

```
VITE_API_BASE_URL=https://실제API주소
```

> ⚠️ `.env` 파일은 절대 git에 올리면 안 됩니다. (이미 `.gitignore`에 등록되어 있습니다)

### 5단계 — 개발 서버 실행

```bash
npm run dev
```

터미널에 아래와 같이 뜨면 성공입니다!

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

브라우저에서 `http://localhost:5173` 으로 접속하면 프로젝트가 보입니다.

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

---

## 4. 이슈 생성하기

> 모든 작업은 반드시 이슈로 시작합니다.

1. GitHub 레포 → `Issues` 탭 → `New Issue` 클릭
2. 작업 유형에 맞는 템플릿 선택 (✨ 기능 개발 / 🐛 버그 수정 / 💄 디자인 수정)
3. 제목 형식: `[태그] 작업 요약`
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

## 6. 개발하기

이제 코드를 작성하면 됩니다! 🎉

개발 서버가 꺼져 있다면 다시 실행하세요:

```bash
npm run dev
```

### 주의사항

- `pageRoutes.jsx` 파일을 수정해야 할 때는 **반드시 카톡방에 먼저 공유** 후 작업하세요.
- API URL, token 등 민감한 정보는 **절대 코드에 직접 쓰지 않고** `.env`에만 작성하세요.
- 작업 전 항상 `git pull origin develop`으로 최신 상태를 유지하세요.

---

## 7. 커밋하기

> 작업 단위가 완료될 때마다 커밋합니다.

### 1단계 — 변경된 파일 확인

```bash
git status
```

빨간색으로 표시된 파일들이 아직 커밋되지 않은 변경 사항입니다.

### 2단계 — 파일 스테이징

커밋할 파일을 선택합니다.

```bash
# 전체 파일 한번에 추가
git add .

# 특정 파일만 추가
git add src/pages/MainPage/MainPage.jsx
```

### 3단계 — gitmoji로 커밋

일반 `git commit` 대신 아래 명령어를 사용합니다.

```bash
gitmoji -c
```

그러면 아래 순서로 입력창이 나타납니다.

**① 이모지 선택**

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

**② 커밋 제목 입력**

```
Feat: 메인페이지 개발 (#3)
```

형식: `태그: 작업 내용 (#이슈번호)`

**③ 커밋 메시지 입력 **

작업내용을 간단히 설명해주세요.

---

### 4단계 — 원격 저장소에 push

```bash
git push origin 브랜치명
```

예시:

```bash
git push origin feat/#3/mainPage
```

---

## 8. PR 올리기

### 1단계 — GitHub에서 PR 생성

1. GitHub 레포 페이지로 이동
2. 상단에 `Compare & pull request` 버튼 클릭 (push 후 자동으로 뜹니다)
3. base 브랜치가 `develop`인지 확인
4. PR 템플릿에 맞게 내용 작성
5. 우측에서 `Assignees` → 본인 선택
6. `Labels` → 작업 유형 선택 (Feat / Fix / Design)
7. `Create pull request` 클릭

### 2단계 — 카톡방에 PR 링크 공유

PR 생성 후 반드시 카톡방에 PR 링크와 함께 리뷰 요청을 합니다.

### 3단계 — 머지

코드 리뷰 완료 후 **PR 올린 본인이 직접 머지**합니다.

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
gitmoji -c

# push
git push origin 브랜치명

# 개발 서버 실행
npm run dev

# 패키지 설치
npm install
```

---

> 궁금한 점은 카톡방에 편하게 질문하세요! 😊
