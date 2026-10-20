@AGENTS.md

# MARUBIT

인스타그램 채널 분석 사이트 (Next.js 16 App Router, TypeScript, Tailwind v4, Recharts).

- 스냅샷 스키마·숫자 파서: `src/lib/schema.ts` (zod). 스키마를 바꾸면 `collectPrompt()`와 테스트도 함께 수정
- 지표 계산(순수 함수): `src/lib/metrics.ts`(피드), `src/lib/stories.ts`(스토리, 스냅샷 간 중복 제거) + 각 `*.test.ts`
- `prompts.test.ts`가 수집 프롬프트 예시 JSON을 스키마로 검증한다 — 프롬프트나 스키마를 바꾸면 이 테스트로 확인
- 수집/분석 프롬프트: `src/lib/prompts.ts` — 스킬(`.claude/skills/ig-*`)은 이 파일을 참조만 한다
- 저장소: `src/lib/storage.ts` — `DATABASE_URL` 있으면 Neon Postgres, 없으면 `data/` 파일
- 인증: `src/proxy.ts` (Next 16의 middleware) + `SITE_PASSWORD`
- 확인: `npm test`, `npm run lint`, `npm run build`
- 실제 수집 데이터는 커밋하지 않는다 (`data/channels/sample_*`만 커밋)
