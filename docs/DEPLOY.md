# 배포 가이드 (Vercel + Neon)

## 1. Vercel 프로젝트
1. https://vercel.com → **Add New → Project** → GitHub `yujida/MARUBIT` 가져오기. Framework는 Next.js로 자동 인식됩니다.
2. 배포 전에 아래 환경 변수를 설정합니다.

## 2. 데이터베이스 (Neon Postgres, 무료 플랜 가능)
1. Vercel 프로젝트 → **Storage → Create Database → Neon** 선택 → 프로젝트에 연결.
2. `DATABASE_URL`이 자동으로 등록됩니다. 테이블은 첫 요청 때 자동으로 생성됩니다(`snapshots`, `reports`).

> Vercel 서버는 파일을 저장할 수 없으므로 배포 환경에서는 `DATABASE_URL`이 꼭 필요합니다.

## 3. 환경 변수
| 이름 | 필수 | 설명 |
|---|---|---|
| `SITE_PASSWORD` | ✅ | 사이트 접속 비밀번호. 비어 있으면 누구나 접근 가능하니 반드시 설정 |
| `DATABASE_URL` | ✅ | Neon 연결 시 자동 등록 |
| `SITE_URL` | 선택 | 수집 프롬프트에 넣을 사이트 주소 (예: `https://marubit.vercel.app`). 비우면 접속한 주소를 사용 |

## 4. 확인
- 배포 주소 접속 → 로그인 화면 → 비밀번호 입력
- `/collect`에서 내 계정 프롬프트를 만들어 Claude in Chrome으로 첫 수집
- Claude in Chrome도 같은 Chrome을 쓰므로, 사이트에 한 번 로그인해 두면 `/import` 저장이 바로 됩니다.

## API (선택)
`Authorization: Bearer <SITE_PASSWORD>` 헤더로 호출합니다.
- `GET /api/snapshots` — 계정 목록, `?handle=xxx` — 해당 계정 스냅샷
- `POST /api/snapshots` — 스냅샷 JSON 저장
- `POST /api/reports` — `{ handle, title, markdown }` 리포트 저장
