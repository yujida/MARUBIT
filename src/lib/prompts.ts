import type { Snapshot } from "./schema";
import { growth, summarize, TYPE_LABEL, DAY_LABEL } from "./metrics";
import { STICKER_LABEL, summarizeStories } from "./stories";

export const DEFAULT_POST_COUNT = 20;

/* ------------------------------------------------------------------ */
/* 1. 수집 프롬프트 — Claude in Chrome에 붙여 넣는다                      */
/* ------------------------------------------------------------------ */

const STICKER_GUIDE =
  'poll(투표), quiz(퀴즈), question(질문), slider(이모지 슬라이더), link(링크), mention(멘션 @), hashtag(해시태그), location(위치), music(음악), countdown(카운트다운), add_yours(내 차례), product(상품), gif(GIF), other(그 밖)';

export function collectPrompt(opts: {
  handle: string;
  role: "own" | "competitor";
  postCount?: number;
  siteUrl: string;
  /** 경쟁 계정의 현재 스토리까지 열어 볼지 (열면 상대방 조회자 목록에 표시됨) */
  includeStories?: boolean;
}): string {
  const n = opts.postCount ?? DEFAULT_POST_COUNT;
  const own = opts.role === "own";
  const importUrl = `${opts.siteUrl}/import`;
  const competitorStories = !own && !!opts.includeStories;

  const steps: string[] = [];
  steps.push(`https://www.instagram.com/${opts.handle}/ 로 이동해 프로필 상단을 읽습니다: 이름, 소개글, 링크, 카테고리, 인증 배지, 게시물 수, 팔로워 수, 팔로잉 수, 하이라이트 개수.`);
  steps.push(`그리드의 최신 게시물 **${n}개**(고정 게시물 포함, 고정이면 pinned: true)를 위에서부터 차례로 엽니다. 각 게시물에서:
   - shortcode(URL의 /p/<코드>/ 또는 /reel/<코드>/ 부분)와 url
   - type: 릴스면 "reel", 여러 장이면 "carousel"(장수는 carouselCount), 한 장이면 "image"
   - postedAt: 게시물의 <time datetime="..."> 값(ISO 형식, 예: 2026-09-28T10:02:00.000Z)
   - caption 전문, hashtags(# 없이), mentions(@ 없이)
   - likes: "좋아요 N개". 좋아요 수가 숨겨져 있으면 null
   - comments: 그리드에서 마우스를 올리면 보이는 댓글 수(안 보이면 null)
   - views: 릴스 조회수 — 프로필의 "릴스" 탭(https://www.instagram.com/${opts.handle}/reels/) 썸네일에 표시된 재생 수를 shortcode로 맞춰 넣으세요. 릴스가 아니면 null
   - category: 다음 중 하나로 직접 판단 — "교육", "대중문화", "춤", "일상", "홍보", "기타"
   - topic: 이 게시물의 주제를 10~20자로 요약
   - hook: 캡션 첫 줄 또는 영상 첫 화면 문구(보이는 경우)`);
  if (own) {
    steps.push(`**내 계정 인사이트** (비즈니스 계정): 각 게시물의 "인사이트 보기"를 열어 보이는 값만 insights에 넣습니다 — reach(도달 계정), views(조회), saves(저장), shares(공유), profileVisits(프로필 방문), follows(팔로우), avgWatchTimeSec(평균 시청 시간, 초). 계정 전체 인사이트(프로페셔널 대시보드)가 보이면 accountInsights에 기간(일), 도달 계정, 참여 계정, 프로필 방문, 팔로워 증감, 비팔로워 도달 비율(%)을 넣으세요. 웹에서 보이지 않는 항목은 null로 둡니다.`);
    steps.push(`**내 스토리** — 최근 14일 동안 올린 스토리를 한 장(프레임)씩 stories에 넣습니다.
   - 목록: 스토리 보관함 https://www.instagram.com/archive/stories/ 에서 확인합니다. 보관함이 비어 있거나 열리지 않으면 프로필 사진을 눌러 지금 올라와 있는 스토리만 봅니다.
   - 각 장에서: postedAt(게시 시각, ISO), type("image" 또는 "video"), durationSec(영상 길이, 보이면), text(화면 위 글자를 한 줄로 요약), stickers(붙은 스티커 종류 배열: ${STICKER_GUIDE}), linkUrl(링크 스티커 주소), isReshare(피드 게시물·릴스·다른 사람 게시물을 공유한 장이면 true), category, topic
   - 수치: Meta Business Suite(https://business.facebook.com) → 인사이트 → 콘텐츠에서 유형을 "스토리"로 거르면 스토리별 수치가 나옵니다. 게시 시각으로 위 목록과 짝을 맞춰 insights에 넣으세요 — reach(도달), views(조회), replies(답장), shares(공유), profileVisits(프로필 방문), follows(팔로우), linkClicks(링크 클릭), stickerTaps(스티커 탭), forwardTaps(앞으로 넘기기), backTaps(뒤로 가기), exits(나가기), nextStory(다음 스토리). Business Suite에 들어갈 수 없거나 값이 안 보이면 insights는 null로 둡니다.
   - 스토리가 하나도 없으면 stories: [] 로 둡니다.
   - **하이라이트**: 프로필의 하이라이트를 차례로 열어 제목(title)과 담긴 스토리 수(itemCount)를 highlights에 넣습니다.`);
  } else {
    steps.push(`**하이라이트**: 프로필 아래 하이라이트 동그라미의 **제목만** 읽어 highlights에 넣습니다(itemCount는 null). 하이라이트는 **열지 마세요** — 최근 48시간 안에 올라온 스토리가 담겨 있으면 상대방 조회자 목록에 표시될 수 있습니다. 하이라이트가 없으면 highlights: [].`);
    steps.push(
      competitorStories
        ? `**현재 스토리** (사용자가 수집을 허용함 — 열면 상대방 조회자 목록에 내 계정이 표시됩니다): 프로필 사진에 색 테두리가 있으면 눌러 지금 올라와 있는 스토리를 처음부터 끝까지 봅니다.
   - 장마다 **일시정지**(스페이스바 또는 일시정지 버튼)한 뒤 읽고, 오른쪽을 눌러 다음 장으로 넘어갑니다. 다 보면 Esc로 닫습니다.
   - **절대 누르지 말 것**: 투표·퀴즈·슬라이더·질문 스티커(누르면 응답이 상대방에게 전송됨), 답장 입력칸, 하트, 이모지 반응, 공유 버튼.
   - 각 장에서: postedAt(<time datetime> 값, 없으면 "N시간" 표시와 지금 시각으로 계산), type("image"/"video"), durationSec(보이면), text(화면 위 글자 한 줄 요약), stickers(${STICKER_GUIDE}), linkUrl, isReshare(게시물·릴스 공유 장이면 true), category, topic. insights는 null.
   - 프로필 사진에 테두리가 없으면(스토리 없음) stories: [].`
        : `**스토리**: 이번 수집에서는 경쟁 계정의 스토리를 열지 않습니다. stories는 null로 둡니다.`,
    );
  }
  steps.push(`아래 형식의 JSON 하나를 만듭니다.

\`\`\`json
{
  "schemaVersion": 1,
  "handle": "${opts.handle}",
  "collectedAt": "<지금 시각, ISO 8601, 예: 2026-10-05T21:30:00+09:00>",
  "source": "computer-use",
  "role": "${opts.role}",
  "profile": {
    "displayName": "...", "bio": "...", "externalUrl": "...", "category": "...",
    "verified": false, "posts": 412, "followers": "1.8만", "following": 210, "highlights": 7
  },
  "accountInsights": ${own ? `{ "periodDays": 30, "accountsReached": null, "accountsEngaged": null, "profileVisits": null, "followerChange": null, "nonFollowerReachPct": null }` : "null"},
  "posts": [
    {
      "shortcode": "C9xYz12AbC", "url": "https://www.instagram.com/reel/C9xYz12AbC/",
      "type": "reel", "postedAt": "2026-09-28T10:02:00.000Z",
      "caption": "...", "hashtags": ["댄스"], "mentions": [],
      "likes": "1,203", "comments": 48, "views": "3.5만", "carouselCount": null, "pinned": false,
      "category": "춤", "topic": "아이돌 신곡 챌린지 커버", "hook": "30초 안에 따라하기",
      "insights": ${own ? `{ "reach": null, "views": null, "saves": null, "shares": null, "profileVisits": null, "follows": null, "avgWatchTimeSec": null }` : "null"}
    }
  ],
  "stories": ${
    own || competitorStories
      ? `[
    {
      "postedAt": "2026-10-04T12:30:00.000Z", "type": "image", "durationSec": null,
      "text": "오늘 수업 신청 마감 D-1", "stickers": ["countdown", "link"], "linkUrl": "https://...",
      "isReshare": false, "category": "홍보", "topic": "원데이 클래스 마감 알림",
      "insights": ${own ? `{ "reach": 820, "views": 905, "replies": 3, "shares": 1, "profileVisits": 12, "follows": 0, "linkClicks": 41, "stickerTaps": null, "forwardTaps": 210, "backTaps": 8, "exits": 64, "nextStory": 30 }` : "null"}
    }
  ]`
      : "null"
  },
  "highlights": [{ "title": "수업 후기", "itemCount": ${own ? "24" : "null"} }],
  "notes": "<수집 중 특이사항: 숨겨진 좋아요, 못 읽은 항목, 스토리 수집 여부 등>"
}
\`\`\``);
  steps.push(`새 탭에서 ${importUrl} 를 열고, 입력칸에 JSON 전체를 붙여 넣은 뒤 "저장"을 누르세요. 오류 메시지가 나오면 JSON을 고쳐서 다시 저장합니다. 사이트에 접근할 수 없으면 JSON을 코드 블록으로 저에게 보여 주세요.`);

  return `당신은 인스타그램 채널 데이터를 수집하는 리서처입니다. 지금 열려 있는 Chrome(인스타그램에 로그인된 상태)에서 @${opts.handle} 계정의 공개 정보${own ? "와 내 계정 인사이트(게시물·스토리)" : ""}를 읽어 아래 JSON 형식으로 정리해 주세요.

## 꼭 지킬 규칙
- **읽기 전용**: 좋아요, 팔로우, 댓글, DM, 저장, 공유, 스토리 답장·반응·스티커 누르기 등 어떤 상호작용도 하지 마세요. 게시물·스토리 열기/닫기, 일시정지, 스크롤, 탭 이동만 합니다.
- **사람 속도**: 게시물 사이에 2~3초 정도 쉬어 가세요. 로그인 요구·보안 확인·"잠시 후 다시 시도" 화면이 나오면 즉시 멈추고 저에게 알려 주세요.
- **지어내지 않기**: 화면에서 확인하지 못한 값은 반드시 null. 추정치를 넣지 마세요.
- 숫자는 화면에 보이는 그대로 적어도 됩니다("1.2만", "3,401", "12.3K" 모두 허용). 더 정확한 값(마우스를 올렸을 때 나오는 숫자, title 속성 등)이 보이면 그 값을 쓰세요.

## 수집 순서
${steps.map((t, i) => `${i + 1}. ${t}`).join("\n")}

마지막에 수집한 게시물 수, 스토리 장수, null로 남긴 항목, 특이사항을 짧게 보고해 주세요.`;
}

/* ------------------------------------------------------------------ */
/* 2. 분석 프롬프트 — 데이터를 담아 Claude에게 리포트를 요청한다             */
/* ------------------------------------------------------------------ */

const pct = (x: number | null, d = 2) => (x == null ? null : +(x * 100).toFixed(d));

function compactSummary(snaps: Snapshot[]) {
  const latest = snaps[snaps.length - 1];
  const s = summarize(latest);
  const g = growth(snaps);
  const ranked = [...s.rows].filter((r) => r.vsMedian != null).sort((a, b) => b.vsMedian! - a.vsMedian!);
  const postBrief = (r: (typeof s.rows)[number]) => ({
    date: r.post.postedAt?.slice(0, 10) ?? null,
    type: TYPE_LABEL[r.post.type],
    category: r.category,
    topic: r.post.topic,
    hook: r.post.hook,
    caption: (r.post.caption ?? "").slice(0, 160),
    likes: r.post.likes,
    comments: r.post.comments,
    views: r.post.views,
    erPct: pct(r.er),
    vsMedian: r.vsMedian == null ? null : +r.vsMedian.toFixed(2),
    ...(r.post.insights ? { insights: r.post.insights, erReachPct: pct(r.erReach) } : {}),
  });
  const busiest = s.heatmap
    .flatMap((row, d) => row.map((c, h) => ({ when: `${DAY_LABEL[d]} ${h}시`, ...c })))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((c) => ({ when: c.when, posts: c.count, medianErPct: pct(c.medianEr) }));

  return {
    handle: latest.handle,
    role: latest.role,
    collectedAt: latest.collectedAt,
    snapshots: snaps.length,
    profile: latest.profile,
    accountInsights: latest.accountInsights,
    kpi: {
      followers: s.followers,
      followerDeltaSinceFirstSnapshot: g.followerDelta,
      weeklyFollowerGrowthPct: pct(g.weeklyGrowthRate),
      postsAnalyzed: s.postsAnalyzed,
      medianErPct: pct(s.medianEr),
      meanErPct: pct(s.meanEr),
      medianErByReachPct: pct(s.medianErReach),
      medianReelViews: s.medianReelViews,
      medianReelViewRatePct: pct(s.medianViewRate, 0),
      commentToLikePct: pct(s.commentToLikeRatio),
      postsPerWeek: s.postsPerWeek == null ? null : +s.postsPerWeek.toFixed(2),
      likesHiddenPosts: s.likesHiddenCount,
    },
    byFormat: s.byType.map((t) => ({ format: TYPE_LABEL[t.key as keyof typeof TYPE_LABEL], n: t.count, medianErPct: pct(t.medianEr), medianViews: t.medianViews })),
    byCategory: s.byCategory.map((t) => ({ category: t.key, n: t.count, medianErPct: pct(t.medianEr) })),
    byCaptionLength: s.byCaptionLength.map((t) => ({ bucket: t.key, n: t.count, medianErPct: pct(t.medianEr) })),
    topHashtags: s.hashtags.slice(0, 15).map((t) => ({ tag: t.tag, n: t.count, medianErPct: pct(t.medianEr) })),
    postingSlots: busiest,
    followerHistory: g.points.map((p) => ({ date: p.date.slice(0, 10), followers: p.followers })),
    topPosts: ranked.slice(0, 5).map(postBrief),
    bottomPosts: ranked.slice(-5).reverse().map(postBrief),
    stories: storyBrief(snaps),
  };
}

function storyBrief(snaps: Snapshot[]) {
  const st = summarizeStories(snaps);
  if (!st.collected) return { collected: false as const };
  const recent = st.rows.slice(0, 15).map((r) => ({
    date: r.story.postedAt?.slice(0, 16) ?? null,
    position: r.position,
    type: r.story.type,
    stickers: r.story.stickers.map((k) => STICKER_LABEL[k]),
    reshare: r.story.isReshare,
    category: r.category,
    topic: r.story.topic ?? r.story.text,
    ...(r.story.insights
      ? { reach: r.story.insights.reach, replies: r.story.insights.replies, exitRatePct: pct(r.exitRate, 1), linkClicks: r.story.insights.linkClicks }
      : {}),
  }));
  return {
    collected: true as const,
    note: st.hasInsights
      ? "내 계정 스토리 인사이트 포함"
      : "경쟁 계정: 수집 시점에 올라와 있던 스토리만 보임(실제 게시량보다 적을 수 있음), 수치 없음",
    frames: st.frames,
    storyDays: st.storyDays,
    medianFramesPerDay: st.medianFramesPerDay,
    stickerSharePct: pct(st.stickerShare, 0),
    linkSharePct: pct(st.linkShare, 0),
    resharePct: pct(st.reshareShare, 0),
    ...(st.hasInsights
      ? {
          medianReachRatePct: pct(st.medianReachRate, 1),
          medianCompletionPct: pct(st.medianCompletion, 0),
          medianReplyRatePct: pct(st.medianReplyRate),
          medianExitRatePct: pct(st.medianExitRate, 1),
          medianForwardRatePct: pct(st.medianForwardRate, 1),
          medianLinkClickRatePct: pct(st.medianLinkClickRate),
          storyReachVsFeedReach: st.storyVsFeed == null ? null : +st.storyVsFeed.toFixed(2),
          retentionByPosition: st.positionCurve.map((p) => ({ position: p.label, days: p.days, retentionPct: pct(p.medianRetention, 0) })),
        }
      : {}),
    bySticker: st.bySticker.map((g) => ({
      sticker: STICKER_LABEL[g.key as keyof typeof STICKER_LABEL] ?? g.key,
      n: g.count,
      ...(st.hasInsights ? { medianReachRatePct: pct(g.medianReachRate, 1), medianReplyRatePct: pct(g.medianReplyRate) } : {}),
    })),
    highlights: st.highlights,
    recentFrames: recent,
  };
}

export function analyzePrompt(target: Snapshot[], peers: Snapshot[][]): string {
  const t = compactSummary(target);
  const own = t.role === "own";
  const peerData = peers.filter((p) => p.length).map((p) => {
    const c = compactSummary(p);
    const stories = c.stories.collected
      ? { frames: c.stories.frames, storyDays: c.stories.storyDays, bySticker: c.stories.bySticker, highlights: c.stories.highlights }
      : null;
    return { handle: c.handle, role: c.role, kpi: c.kpi, byFormat: c.byFormat, byCategory: c.byCategory, topPosts: c.topPosts.slice(0, 3), stories };
  });

  return `당신은 교육·대중문화·춤 분야 인스타그램 마케팅 분석가입니다. 아래 데이터는 @${t.handle} (${own ? "내 계정" : "경쟁·벤치마크 계정"})을 Chrome 화면에서 직접 수집해 계산한 값입니다. 이 데이터만 근거로 한국어 리포트를 작성하세요.

## 분석 원칙
- **숫자는 데이터에 있는 것만** 인용합니다. 없는 값(null)은 "미수집"으로 밝히고 추정하지 않습니다.
- 팔로워 수·좋아요 같은 허영 지표보다 **신호 지표**(참여율, 릴스 조회율, 댓글/좋아요 비율${own ? ", 저장·공유, 도달 기준 참여율, 비팔로워 도달" : ""})를 우선합니다.
- 평균 대신 **중앙값**과 "중앙 대비 배수"로 판단합니다. 게시물 20개 내외의 작은 표본이므로 **상관은 인과가 아님**을 지키고, n이 3 미만인 그룹은 참고로만 언급합니다.
- 포맷의 역할을 구분합니다: **릴스 = 비팔로워 도달**, **캐러셀 = 저장/권위**, 사진 = 낮은 발견성, **스토리 = 기존 팔로워와의 관계 유지**(답장·스티커 반응·완주율이 핵심 신호).
- 스토리 데이터(stories)가 collected: false면 스토리는 "미수집"으로만 언급합니다. 경쟁 계정 스토리는 수집 시점에 보인 것만이라 게시 빈도를 단정하지 않습니다.
- 모든 권고는 **이 계정이 다음 2주 안에 실행할 수 있는 구체적 행동**이어야 합니다.

## 리포트 구성 (Markdown)
1. **한 줄 요약** — 지금 이 채널의 상태를 한 문장으로.
2. **핵심 지표** — 표 하나 (지표 · 값 · 해석).${peerData.length ? " 비교 계정 대비 위치도 표시." : ""}
3. **성장 단계 진단** — 도달 → 팔로우 전환 → 유지/공유 → 지속 가능성 중 **막힌 한 단계**를 근거와 함께 지목.
4. **무엇이 먹히는가** — 상위 게시물의 공통 메커니즘(주제·훅·포맷·시간대). 단순 복제가 아닌 **반복 가능한 원리**로 정리.
5. **무엇이 안 먹히는가** — 하위 게시물 패턴.
6. **스토리 점검** — 스토리를 수집했다면: 하루 장수와 순서별 이탈, 답장·스티커 반응을 끌어낸 스티커, 링크 클릭, 피드·릴스 공유 활용, 하이라이트 구성(처음 온 사람에게 계정을 설명하는지). 미수집이면 한 줄로 밝히고 넘어갑니다.
7. **콘텐츠 감사 (Keep / Refresh / Kill)** — 카테고리·포맷·시리즈 단위로 유지·확대 / 개선 후 재시도 / 중단. *Kill보다 Refresh 먼저.*
8. **${own ? "경쟁 대비 화이트스페이스" : "이 계정에서 배울 점과 빈틈"}** — ${own ? "비교 계정이 하지 않는 주제·포맷·관점 중 내가 차지할 수 있는 자리." : "이 계정이 잘하는 것(벤치마크 포인트)과 놓치고 있는 주제·포맷·관점(내가 공략할 빈틈)."}
9. **다음 2주 실행 계획** — 정확히 3가지 권고 + 각 권고의 측정 지표와 목표치(현재값 기준).
10. **다음 게시물 아이디어 5개** — 형식: 포맷(스토리 포함 가능) / 카테고리 / 훅 문장 / 왜 먹힐지(데이터 근거).
11. **데이터 한계** — 미수집 항목, 표본 크기, 해석 주의점.

## 데이터: @${t.handle}
\`\`\`json
${JSON.stringify(t, null, 1)}
\`\`\`
${
  peerData.length
    ? `
## 비교 계정
\`\`\`json
${JSON.stringify(peerData, null, 1)}
\`\`\`
`
    : ""
}
리포트 제목은 "# @${t.handle} 채널 분석 — <날짜>" 형식으로 시작하세요.`;
}
