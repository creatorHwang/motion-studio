# 레이더+ API 계약 초안 v1

작성일: 2026-11-02  
상태: 구현 전 계약 초안. 운영 D1·KV·secret 변경 없음.

## 1. 경계와 원칙

- 고객 브라우저는 같은 출처의 `https://thehansu.net/api/plus/*`만 호출한다.
- THE한수 서버만 `https://finder.thehansu.net/internal/plus/*`를 호출한다.
- 서버 간 인증값 `X-Plus-Secret`은 양쪽 Cloudflare secret에만 둔다.
- 브라우저 응답, JavaScript, 로그, 문서에 secret을 포함하지 않는다.
- 성공 응답은 THE한수 쪽에서 최대 30분 캐시한다.
- 원천 일부가 실패해도 정상 원천은 반환한다. 전체 실패일 때만 503을 사용한다.
- 원천별 지수를 합쳐 하나의 절대 점수로 표현하지 않는다.

## 2. 공개 엔드포인트

| 경로 | 용도 | 기본 캐시 |
|---|---|---:|
| `GET /api/plus/opportunities?category=&limit=10` | 오늘의 콘텐츠 기회 | 30분 |
| `GET /api/plus/growth-videos?category=&limit=10&locale=ko` | 미리 수집된 성장 영상 | 30분 |
| `GET /api/plus/evidence?itemId=` | 선택 항목의 원천·단위·수집 시각 | 30분 |
| `GET /api/plus/status` | 원천별 최신성만 제공 | 5분 |

`category`는 생략 가능하며, `limit`은 1~20만 허용한다. 공개 API는 신규 YouTube 검색을 유발하지 않고 이미 수집된 데이터만 읽는다.

## 3. 공통 응답

```json
{
  "schemaVersion": "1.0",
  "serverTime": "2026-11-02T09:15:00+09:00",
  "collectedAt": "2026-11-02T09:10:00+09:00",
  "cache": { "hit": true, "maxAgeSeconds": 1800 },
  "sourceStatus": {
    "naver": "ok",
    "youtube": "stale",
    "googleTrends": "unavailable"
  },
  "data": []
}
```

- `serverTime`: 응답을 만든 서버 시각.
- `collectedAt`: 응답에 포함된 가장 오래된 원천 데이터의 수집 시각. 데이터가 없으면 `null`.
- `sourceStatus`: `ok`, `stale`, `unavailable`, `disabled` 중 하나.
- `stale`: 마지막 정상 데이터는 있으나 원천별 최신성 기준을 넘긴 상태.
- 알 수 없는 숫자·날짜는 `0`이 아니라 `null`로 반환한다.

## 4. 콘텐츠 기회 항목

```json
{
  "id": "opp_01J...",
  "topic": "저속 노화 식단",
  "category": "health_fitness",
  "signals": [
    {
      "source": "naver",
      "label": "평소보다 얼마나 더 찾는지",
      "value": 2.4,
      "unit": "relative_ratio",
      "period": "P7D",
      "collectedAt": "2026-11-02T09:10:00+09:00"
    }
  ],
  "summary": "최근 평소보다 더 많이 찾고 있어요.",
  "actions": ["motion", "prompt_librarian"]
}
```

## 5. 성장 영상 항목

```json
{
  "videoId": "youtube-video-id",
  "title": "일주일 저속 노화 도시락",
  "channelTitle": "채널명",
  "thumbnailUrl": "https://i.ytimg.com/...",
  "publishedAt": "2026-10-29T04:00:00Z",
  "firstSeenAt": "2026-10-30T00:10:00Z",
  "lastCollectedAt": "2026-11-02T00:10:00Z",
  "locale": "ko",
  "category": "health_fitness",
  "growth": {
    "viewsPerDay": 12480,
    "viewDelta": 37440,
    "windowHours": 72
  }
}
```

`locale`은 `ko`, `global`, `unknown` 중 하나다. 국가·언어를 확정할 근거가 없으면 `unknown`으로 두며 추정값을 사실처럼 표시하지 않는다.

## 6. 카테고리

| 코드 | 고객 표시 |
|---|---|
| `life_style` | 살림·생활 |
| `fashion_beauty` | 패션·뷰티 |
| `health_fitness` | 건강·운동 |
| `travel_parenting` | 여행·육아 |
| `food_knowledge_business` | 푸드·지식·비즈니스 |
| `issue_entertainment` | 이슈·엔터테인먼트 |
| `sports` | 스포츠 |
| `esports` | e스포츠 |

매핑되지 않은 값은 `other`로 반환하되 고객 화면의 기본 TOP 목록에서는 제외한다.

## 7. 오류

```json
{
  "schemaVersion": "1.0",
  "error": {
    "code": "PLUS_UPSTREAM_UNAVAILABLE",
    "message": "현재 자료를 불러올 수 없습니다.",
    "requestId": "req_..."
  }
}
```

| HTTP | 코드 | 의미 |
|---:|---|---|
| 400 | `PLUS_INVALID_REQUEST` | 허용하지 않는 필터·범위 |
| 404 | `PLUS_NOT_FOUND` | 존재하지 않는 항목 |
| 429 | `PLUS_RATE_LIMITED` | 공개 API 호출 제한 |
| 503 | `PLUS_UPSTREAM_UNAVAILABLE` | 모든 원천 사용 불가 |

내부 오류·키·원천 응답 본문은 고객 메시지에 노출하지 않는다.

## 8. 버전·캐시

- 하위 호환 필드 추가는 `1.x`에서 허용한다.
- 필드 삭제·의미 변경은 `/api/plus/v2`로 분리한다.
- 캐시 키는 `schemaVersion + endpoint + normalized category + limit + locale`로 구성한다.
- 원천 수집 시각이 캐시 생성 시각보다 중요하며 둘을 별도 필드로 유지한다.
- 오류 응답은 장기 캐시하지 않는다. 마지막 정상 응답이 있으면 `stale`로 반환할 수 있다.

## 9. 구현 전 승인 항목

1. THE한수 Worker와 Finder Worker의 실제 라우팅 구조
2. secret 이름과 교체 절차
3. D1 읽기 쿼리와 인덱스 영향
4. 원천별 `stale` 기준
5. 공개 호출 속도 제한
6. 운영 D1 마이그레이션 여부
