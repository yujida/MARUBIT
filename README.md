# MARUBIT — 인스타그램 채널 분석

Claude in Chrome(컴퓨터 유즈)으로 인스타그램 계정을 직접 살펴보고, 수집한 데이터로 채널을 분석하는 웹사이트입니다.
내 계정(비즈니스 인사이트 포함)과 경쟁·벤치마크 계정을 같은 기준으로 비교합니다. 분야: 교육 · 대중문화 · 춤.

```
Claude in Chrome ──(읽기 전용 수집)──▶ 스냅샷 JSON ──▶ /import ──▶ DB
                                                           │
     채널 개요 · 게시물 · 시간대 · 해시태그 · 비교 ◀──지표 계산──┘
                                                           │
     Claude 분석 리포트 ◀──── /channels/<계정>/analyze 프롬프트 ┘
```

## 사용 흐름
1. **수집하기** (`/collect`) — 계정과 구분(내 계정/경쟁)을 넣으면 Claude in Chrome용 프롬프트가 만들어집니다.
2. Chrome에서 인스타그램에 로그인한 상태로 **Claude in Chrome**에 붙여 넣습니다. Claude가 프로필과 최근 게시물 20개를 읽고 이 사이트의 **가져오기**(`/import`)에 저장합니다.
3. **채널** 화면에서 참여율, 릴스 조회율, 포맷·카테고리별 성과, 게시 시간대 히트맵, 해시태그, 팔로워 추이를 봅니다.
4. **AI 분석 리포트** — 계산된 지표가 담긴 프롬프트를 Claude에 붙여 넣고, 받은 리포트를 저장합니다.
5. **비교** — 최대 5개 계정을 비율 지표로 나란히 봅니다.

권장 주기: 1회 = 1계정, 계정당 주 2회.

## 로컬 실행
```bash
npm install
npm run dev          # http://localhost:3000 (데모 계정 3개가 보입니다)
npm test             # 지표 계산 테스트
npm run sample       # 데모 데이터 다시 만들기
npm run prompt -- collect <계정> own|competitor   # 터미널에서 수집 프롬프트
npm run prompt -- analyze <계정> [비교계정...]     # 터미널에서 분석 프롬프트
```
`DATABASE_URL`이 없으면 `data/` 폴더에 파일로 저장합니다(데모 `sample_*`만 git에 포함).

## 배포
Vercel + Neon Postgres + 비밀번호 보호 → [docs/DEPLOY.md](docs/DEPLOY.md)

## 문서
- [설계](docs/DESIGN.md)
- [멀티 플랫폼 확장 설계 (초안)](docs/MULTI_PLATFORM_DESIGN.md)
- [오픈소스 출처](NOTICE.md)
