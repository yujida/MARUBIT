# MARUBIT 멀티 플랫폼 확장 설계안 (v0.1, 논의용 초안)

> 상태: **초안**. 9장의 "결정 필요 사항"을 합의한 뒤 v1.0으로 확정하고 구현합니다.
> 기존 인스타그램 설계는 [DESIGN.md](DESIGN.md)를 참고하세요.

## 1. 목표

- 인스타그램 외에 **YouTube(롱폼·Shorts), TikTok, Threads**(후보)까지 같은 사이트에서 수집하고 분석한다.
- 플랫폼마다 **데이터를 얻는 방법과 중요한 지표가 다르다**는 점을 설계에 반영한다. 같은 이름의 지표라도 뜻이 다르면 따로 계산한다.
- 한 크리에이터·브랜드의 여러 플랫폼 계정을 묶어 **"어디서 무엇이 먹히는지"**를 한 화면에서 본다.
- 기존 인스타 데이터, 화면 주소, 수집 흐름은 그대로 유지한다.

비목표(이번 단계): 게시 예약·자동 게시, 댓글 관리, 비공개 데이터, 대량 크롤링.

## 2. GitHub 레퍼런스 조사

| 프로젝트 | ★ | 라이선스 | 배운 점 | 가져오는 방식 |
|---|---|---|---|---|
| [gitroomhq/postiz-app](https://github.com/gitroomhq/postiz-app) | 36.8k | **AGPL-3.0** | 플랫폼 30여 개를 **"Provider" 하나의 공통 인터페이스**(인증·게시·`analytics()`·`postAnalytics()`)로 추상화. 플랫폼별로 실제로 주는 지표가 다름: YouTube=조회·좋아요·댓글·시청 시간·평균 시청률·구독 증감 / TikTok=조회·좋아요·댓글·공유 / Threads=조회·좋아요·답글·리포스트·인용 / X=노출·좋아요·리트윗·답글·인용·북마크 | **구조 아이디어만** 참고. AGPL이라 코드를 복사하면 우리 사이트 전체 소스 공개 의무가 생기므로 코드는 쓰지 않음 |
| [spacesdrive/twiligent](https://github.com/spacesdrive/twiligent) | 88 | MIT | YouTube+Instagram 통합 대시보드. **공식 API**로 수집, Shorts/롱폼 분리, 통합 개요(플랫폼별 오디언스 비교·점유율), **바이럴 점수**(최고 ÷ 평균), **꾸준함 점수**(100 ÷ (1 + 변동계수)) | 지표 정의와 화면 구성 참고 (MIT, 출처 표기) |
| [Hwemo-Chung/threads-analytics](https://github.com/Hwemo-Chung/threads-analytics) | 5 | 표기 없음 | 한국어 Threads 분석 도구. **"평균은 거짓말한다"** → 중앙값과 함께 **데드율**(기준 이하 게시물 비율), **바이럴 집중도**(상위 게시물이 가져간 조회 비중, 평균/중앙값 비율), **표본이 적은 시간대는 판정 보류** | 라이선스가 없어 **아이디어만** 참고, 코드는 쓰지 않음 |
| [social-media-skills/skills](https://github.com/social-media-skills/skills) | 125 | MIT | 플랫폼별 핵심 신호: **TikTok**=완주율·재시청, **Shorts**=시청 vs 스와이프, **YouTube 롱폼**=클릭률(CTR)과 평균 시청 시간(AVD)의 균형, **Threads**=답글·첫 1시간 반응 속도 | 플랫폼별 분석 프롬프트에 반영 (이미 인스타 분석에 쓰는 중) |
| instaloader, TikTok 스크래퍼 등 | – | – | 데이터 필드 구성 참고 | **쓰지 않음** — 약관 위반·차단 위험 (인스타 때와 같은 원칙) |

## 3. 플랫폼별 데이터 수집 방법

핵심: **공식 API로 공개 데이터를 받을 수 있는 곳은 API로 자동 수집**하고, 그렇지 않은 곳은 지금처럼 **Claude in Chrome(컴퓨터 유즈)**으로 수집한다.

| 플랫폼 | 경쟁 계정 (공개 데이터) | 내 계정 (상세 인사이트) | 판단 |
|---|---|---|---|
| **Instagram** | 컴퓨터 유즈 (현재) | 컴퓨터 유즈 (현재). v2: Graph API | 유지 |
| **YouTube** | ✅ **YouTube Data API v3** — API 키 하나로 **어떤 채널이든** 구독자·총 조회수·영상별 조회/좋아요/댓글·길이·태그를 받음. 무료 하루 10,000 단위로 충분 | YouTube Studio를 컴퓨터 유즈로 읽기(시청 시간, 평균 시청률, 클릭률). v2: YouTube Analytics API(OAuth) | **API 자동 수집**. 사람 손 필요 없음 |
| **TikTok** | 컴퓨터 유즈 — 프로필 그리드에 조회수, 영상 화면에 좋아요·댓글·저장·공유가 보임. 공식 API는 경쟁 계정 조회를 허용하지 않음(연구자용 API만 가능) | TikTok Studio(웹)를 컴퓨터 유즈로 읽기: 완주율, 평균 시청 시간, 추천 피드 유입 비율 등 | 컴퓨터 유즈 |
| **Threads** | 컴퓨터 유즈 — 좋아요·답글·리포스트가 보임. 조회수는 공개 범위가 바뀌어 왔으므로 첫 수집 때 확인하고, 안 보이면 null | 컴퓨터 유즈(인사이트 화면) 또는 v2: Threads API(OAuth, 내 계정만) | 컴퓨터 유즈 |
| X, 네이버 블로그, Facebook | (후보) | (후보) | 9장에서 결정 |

> YouTube API 키는 Google Cloud에서 무료로 발급하고, Vercel 환경 변수 `YOUTUBE_API_KEY`에 넣습니다. 키는 서버에서만 쓰고 브라우저에 노출하지 않습니다.

### 수집 주기
- **YouTube**: Vercel Cron으로 **주 2회 자동 수집**(월·목). 등록한 채널을 순서대로 API로 받아 스냅샷 저장. "지금 수집" 버튼도 제공.
- **컴퓨터 유즈 플랫폼**: 지금처럼 `/collect`에서 플랫폼을 고르면 그 플랫폼 전용 프롬프트가 만들어짐. 1회 = 1계정.

## 4. 구조 — "플랫폼 어댑터"

Postiz의 Provider 구조를 참고해, 플랫폼마다 다른 부분을 **어댑터 하나에 모으고** 나머지(저장·화면·공통 지표)는 공유한다.

```
src/lib/platforms/
  types.ts          ← PlatformAdapter 인터페이스
  instagram.ts      ← 현재 schema/metrics/prompts에서 인스타 전용 부분을 옮김
  youtube.ts        ← + YouTube Data API 수집기 (서버 전용)
  tiktok.ts
  threads.ts
  index.ts          ← 등록부: getAdapter("youtube")
src/lib/metrics/core.ts   ← 플랫폼 공통 계산 (중앙값, 중앙 대비, 빈도, 히트맵, 집중도…)
```

```ts
interface PlatformAdapter {
  id: "instagram" | "youtube" | "tiktok" | "threads";
  label: string;                       // "YouTube"
  formats: Record<string, string>;     // { short: "Shorts", long: "롱폼", live: "라이브" }
  collect:
    | { kind: "computer-use"; prompt(opts): string }        // Claude in Chrome 프롬프트
    | { kind: "api"; fetch(handle, env): Promise<Snapshot> }; // 서버 자동 수집
  primaryMetric: "views" | "interactions";   // 성과 비교 기준 (영상 플랫폼은 조회수)
  engagementRate(item, account): number | null; // 플랫폼별 정의 (5장)
  kpis: KpiDef[];                      // 채널 화면 상단 카드 구성
  glossary: Partial<Glossary>;         // 말풍선 설명 (플랫폼별로 덮어쓰기)
  analysisGuide: string;               // 분석 프롬프트에 넣을 플랫폼 신호 설명
}
```

새 플랫폼 추가 = 어댑터 파일 하나 + 등록부 한 줄 + 데모 데이터.

## 5. 데이터 모델

### 스냅샷 v2 (모든 플랫폼 공통 틀)
```jsonc
{
  "schemaVersion": 2,
  "platform": "youtube",              // instagram | youtube | tiktok | threads
  "handle": "@channel",                 // 플랫폼 안에서 고유한 계정 이름
  "accountId": "UCxxxx",                // 플랫폼 내부 ID (YouTube 채널 ID 등, 선택)
  "collectedAt": "...", "source": "api" | "computer-use" | ...,
  "role": "own" | "competitor",
  "profile": { "displayName", "bio", "followers", "following", "posts", "totalViews", ... },
  "accountInsights": { ... } | null,   // 플랫폼별 키
  "items": [{
    "id": "dQw4w9WgXcQ", "url": "...",
    "format": "short",                 // 플랫폼별 값: reel/carousel/image, short/long/live, video/photo, text/image/video
    "postedAt": "...", "title": "...", "caption": "...", "hashtags": [], "durationSec": 42,
    "metrics": { "views", "likes", "comments", "shares", "saves", "reposts", "quotes" },  // 없는 건 null
    "insights": { ... } | null,        // 내 계정만: 시청 시간, 완주율, CTR, 도달 등
    "category", "topic", "hook"
  }]
}
```
- **기존 인스타 스냅샷(v1)은 그대로 읽는다.** 읽을 때 v2로 변환(`platform: "instagram"`, `posts → items`, `shortcode → id`)만 하고 DB 데이터는 고치지 않는다.
- DB: `snapshots` 테이블에 `platform` 열 추가(기본값 `instagram`), 기본키 `(platform, handle, collected_at)`.

### 브랜드(계정 묶음) — 새 개념
```jsonc
{ "id": "my-dance", "name": "내 댄스 클래스", "role": "own",
  "accounts": [{ "platform": "instagram", "handle": "..." }, { "platform": "youtube", "handle": "@..." }] }
```
같은 크리에이터의 플랫폼별 계정을 묶어 통합 개요를 만든다. 경쟁 크리에이터도 묶을 수 있다.

## 6. 지표

### 6.1 플랫폼마다 다르게 정의하는 지표
| 지표 | Instagram | YouTube | TikTok | Threads |
|---|---|---|---|---|
| **성과 기준** | 반응수(좋아요+댓글) | 조회수 | 조회수 | 반응수 (조회수는 내 계정만) |
| **참여율** | (좋아요+댓글) ÷ 팔로워 | (좋아요+댓글) ÷ **조회수** | (좋아요+댓글+공유+저장) ÷ **조회수** | (좋아요+답글+리포스트+인용) ÷ 팔로워 |
| **도달력** | 릴스 조회 ÷ 팔로워 | 영상 조회 ÷ 구독자 | 조회 ÷ 팔로워 | – |
| **포맷 구분** | 사진·캐러셀·릴스 | Shorts·롱폼·라이브 | 영상·사진 | 텍스트·이미지·영상 |
| **플랫폼 고유 지표** | 저장·공유 (내 계정) | 영상 길이별 성과, 태그 | 공유·저장 비율 | 답글 ÷ 좋아요 (대화성) |
| **내 계정 심화 (컴퓨터 유즈/OAuth)** | 도달, 비팔로워 도달 | 시청 시간, 평균 시청률, CTR, 구독 증감 | 완주율, 평균 시청 시간, 추천 피드 비율 | 조회수, 프로필 방문 |

> 조회수가 공개되는 플랫폼(YouTube·TikTok)은 **조회수 대비 참여율**이 더 정확하다. 팔로워 기준은 인스타·Threads처럼 조회수가 안 보일 때 쓰는 대안이다. 플랫폼마다 정의가 다르므로 **서로 다른 플랫폼의 참여율은 직접 비교하지 않는다.**

### 6.2 모든 플랫폼에 새로 추가할 공통 지표 (레퍼런스에서 차용)
| 지표 | 정의 | 출처 아이디어 |
|---|---|---|
| **부진율** | 성과가 채널 중앙값의 절반 미만인 게시물 비율 | threads-analytics의 데드율 |
| **바이럴 집중도** | 상위 10%(20개면 상위 2개) 게시물이 전체 조회/반응에서 차지하는 비중 + 평균 ÷ 중앙값 | threads-analytics |
| **바이럴 배수** | 최고 성과 ÷ **중앙값** (Twiligent는 평균을 쓰지만, 우리는 중앙값 기준으로 일관성 유지) | Twiligent |
| **꾸준함 점수** | 100 ÷ (1 + 성과의 변동계수). 들쭉날쭉할수록 낮음 | Twiligent |
| **판정 보류** | 그룹 게시물 수가 3개 미만이면 "판단 보류"로 표시 (히트맵, 카테고리, 포맷) | threads-analytics |

### 6.3 플랫폼 간 비교에서 쓰는 지표 (정규화)
- 팔로워 **증가율**(첫 수집 대비 %), 주간 성장률
- **자기 중앙값 대비** 성과 (각 플랫폼 안에서 상위·하위 판단 후 비교)
- 카테고리(교육·대중문화·춤)별 "어느 플랫폼에서 잘 되나" — 플랫폼마다 카테고리 성과 순위를 나란히 표시
- 같은 계정 안에서 플랫폼별 팔로워 점유율

## 7. 화면

| 화면 | 변경 |
|---|---|
| 상단 메뉴 | 채널 · **브랜드** · 비교 · 수집하기 · 가져오기 |
| 채널 목록 `/` | 플랫폼 필터 탭(전체·Instagram·YouTube·TikTok·Threads), 카드에 플랫폼 아이콘 |
| 채널 상세 `/channels/[platform]/[handle]` | KPI 카드·표 열·포맷 이름이 **어댑터 정의**를 따름. 기존 `/channels/[handle]` 주소는 인스타로 자동 이동 |
| **브랜드 개요** `/brands/[id]` (신규) | 플랫폼별 팔로워·성장률 카드, 오디언스 점유율, 카테고리 × 플랫폼 성과 표, 플랫폼별 최고 게시물 |
| 비교 `/compare` | 같은 플랫폼끼리만 비교 (플랫폼 먼저 선택) |
| 수집하기 `/collect` | 플랫폼 선택 → YouTube는 **"지금 자동 수집"** 버튼, 나머지는 Claude in Chrome 프롬프트 |
| 분석 리포트 | 플랫폼별 분석 기준 + **브랜드 통합 리포트**(플랫폼별 역할 정리, 재활용 전략) |

말풍선 설명은 플랫폼에 따라 달라진다. 예: YouTube에서 "참여율"에 마우스를 올리면 "(좋아요+댓글) ÷ 조회수"로 설명.

## 8. 단계별 계획

| 단계 | 내용 | 비고 |
|---|---|---|
| 0 | 이 설계 합의 | 지금 |
| 1 | 어댑터 구조로 리팩터링 + 스키마 v2 + 기존 인스타 데이터 호환 | 화면 변화 없음, 테스트로 회귀 확인 |
| 2 | **YouTube** (API 자동 수집 + Cron + Shorts/롱폼 분석) | API 키 필요 |
| 3 | **TikTok** (컴퓨터 유즈 수집 프롬프트 + 분석) | |
| 4 | **Threads** (컴퓨터 유즈 수집 프롬프트 + 분석) | |
| 5 | 브랜드 묶음 + 통합 개요 + 통합 리포트 | |
| 6 | 새 공통 지표(부진율·집중도·꾸준함) 인스타에도 적용 | 1단계와 함께 가능 |

플랫폼마다 데모 데이터를 함께 넣어 키 없이도 화면을 확인할 수 있게 한다.

## 9. 결정 필요 사항

1. **추가할 플랫폼과 순서**: 추천은 YouTube → TikTok → Threads (교육·대중문화·춤 분야에서 영향력이 큰 순서, 그리고 YouTube는 자동 수집이 가능해 빨리 효과를 봄). X, 네이버 블로그 등 다른 후보가 있나요?
2. **YouTube API 키**: Google Cloud에서 무료로 발급해 Vercel에 넣어 주실 수 있나요? (발급 방법은 구현 때 안내)
3. **플랫폼별 내 계정 보유 여부**: 각 플랫폼에 내 계정이 있나요? (내 계정이면 Studio·인사이트 화면까지 수집)
4. **브랜드 묶음**: 내 계정들을 하나의 브랜드로 묶는 통합 개요가 필요한가요? 경쟁 크리에이터도 묶을까요?
5. **자동 수집 주기**: YouTube는 주 2회 자동으로 괜찮은가요?
