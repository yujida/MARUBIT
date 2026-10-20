---
name: ig-analyze
description: MARUBIT에 쌓인 인스타 채널 스냅샷으로 마케팅 분석 리포트(성장 단계 진단, Keep/Refresh/Kill 감사, 경쟁 화이트스페이스, 2주 실행 계획, 게시물 아이디어)를 작성한다. "@xxx 분석해줘", "리포트 써줘", "다음에 뭐 올릴까"라고 할 때 사용.
---

# ig-analyze — 채널 분석 리포트

## 절차
1. 분석 프롬프트를 만든다 (지표 계산 + 상·하위 게시물 + 비교 계정 데이터 포함).
   - 사이트: `/channels/<handle>/analyze` 에서 비교 계정을 고르고 복사
   - 터미널(로컬 데이터): `npm run prompt -- analyze <handle> [비교계정 ...]`
2. 프롬프트의 지시대로 리포트를 쓴다. 프롬프트가 곧 분석 기준이다 (`src/lib/prompts.ts`의 `analyzePrompt()`).
3. 저장
   - 사이트 분석 화면의 "리포트 저장" 칸에 붙여 넣기, 또는
   - `curl -X POST "$SITE_URL/api/reports" -H "Authorization: Bearer $SITE_PASSWORD" -H "Content-Type: application/json" -d '{"handle":"...","title":"...","markdown":"..."}'`

## 분석 원칙 (요약)
- 숫자는 데이터에 있는 것만. null은 "미수집"으로 밝힌다.
- 허영 지표(팔로워·좋아요)보다 신호 지표(참여율, 릴스 조회율, 댓글/좋아요, 저장·공유, 도달 기준 참여율).
- 중앙값·"중앙 대비 배수"로 판단. 표본이 작으니 상관 ≠ 인과.
- 포맷 역할: 릴스=비팔로워 도달, 캐러셀=저장/권위, 사진=낮은 발견성.
- 모든 권고는 2주 안에 실행 가능한 구체적 행동.

프레임워크 출처: social-media-skills/skills의 METER(성과 리포트) · AUDIT(콘텐츠 감사) · SCOUT(경쟁 분석) · instagram-growth(성장 루프 진단)를 한국어로 재구성 (MIT, `NOTICE.md` 참고).
