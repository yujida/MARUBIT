---
name: ig-collect
description: 인스타그램 계정 1개를 컴퓨터 유즈(Claude in Chrome 등)로 살펴보고 MARUBIT 스냅샷 JSON으로 수집한다. "@xxx 수집해줘", "인스타 계정 데이터 모아줘", "채널 스냅샷 만들어줘"라고 할 때 사용.
---

# ig-collect — 인스타 채널 스냅샷 수집

MARUBIT은 인스타 로그인 문제를 피하기 위해 **사용자가 이미 로그인한 Chrome을 컴퓨터 유즈로 읽는** 방식으로 데이터를 모은다.
수집 절차·규칙·JSON 형식의 원본은 `src/lib/prompts.ts`의 `collectPrompt()` 하나뿐이다. 내용을 바꾸려면 그 함수를 고친다.

## 사용법

1. 프롬프트 만들기 — 둘 중 하나
   - 사이트: `/collect?handle=<계정>&role=own|competitor` 에서 복사
   - 터미널: `npm run prompt -- collect <계정> own|competitor [게시물수=20]` (`SITE_URL`을 배포 주소로 지정하면 가져오기 링크가 그 주소로 들어간다)
2. 사용자가 Chrome에서 인스타그램에 로그인한 상태로 **Claude in Chrome**에 프롬프트를 붙여 넣는다.
3. Claude in Chrome이 결과 JSON을 사이트 `/import`에 저장한다. 접근이 안 되면 JSON을 받아 아래 중 하나로 저장:
   - 로컬: `data/channels/<handle>/<YYYY-MM-DD>.json` 에 저장 (git에는 sample_* 만 커밋됨)
   - 배포: `curl -X POST "$SITE_URL/api/snapshots" -H "Authorization: Bearer $SITE_PASSWORD" --data-binary @snapshot.json`

## 규칙 (프롬프트에 포함됨)
- 읽기 전용 — 좋아요·팔로우·댓글·DM 등 쓰기 동작 금지
- 사람 속도, 1회 실행 = 1계정, 기본 최근 게시물 20개, 주 2회
- 보안 확인/차단 화면이 뜨면 즉시 중단
- 화면에서 확인 못 한 값은 null (추정 금지)
- 비공개 계정은 수집하지 않는다
