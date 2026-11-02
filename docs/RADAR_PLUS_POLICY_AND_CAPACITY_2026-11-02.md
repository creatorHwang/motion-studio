# 레이더+ 공식 정책·용량 검토

확인일: 2026-11-02  
성격: 제품 설계를 위한 기술 검토이며 법률 자문이 아니다. 공식 문서에서 확인되지 않은 내용은 `미확인`으로 표시한다.

## 결론

1. 레이더+ 고객 화면은 **미리 수집된 자료를 캐시로 읽는 구조**가 적합하다. 고객이 화면을 열 때마다 YouTube 검색을 실행하면 안 된다.
2. YouTube 공개 영상 메타데이터는 30일 안에 삭제하거나 갱신하는 흐름이 필요하다. 현재의 `lastCollectedAt`가 이 통제의 기준 필드가 된다.
3. 조회 증가량 같은 파생 지표는 2026-06-01 이후 별도 승인을 받은 분석 사용 사례에만 장기 저장이 허용되는 정책이 추가되었다. 승인 전에는 30일 갱신 경계를 기본값으로 적용하고, 고객 화면에서 자체 계산값임을 명확히 표시한다.
4. NAVER 데이터랩 검색어 트렌드는 앱별 하루 1,000회다. 서버 캐시와 정기 수집을 사용하면 일반 고객 조회가 이 한도를 직접 소모하지 않게 할 수 있다.
5. Google Trends API는 아직 제한된 알파다. 승인 전에는 운영 필수 원천으로 취급하지 않고 `disabled` 또는 `unavailable` 상태를 허용한다.

## YouTube Data API

### 현재 할당량 구조

- 2026년 공식 문서는 기본 프로젝트에 `search.list` 100회/일과, 그 밖의 엔드포인트 합산 10,000 units/일을 안내한다.
- `search.list` 문서도 검색 전용 버킷에서 요청당 1회로 계산됨을 안내한다.
- 이는 예전의 “검색 1회 = 100 units” 설명과 표시 방식이 달라진 것이다. 제품 내부의 `하루 20회 검색` 제한은 여전히 기본 한도보다 보수적인 안전장치로 유지할 수 있다.
- 추가 할당량은 규정 준수 감사를 통과한 뒤 신청한다. 같은 사용 사례의 할당량을 늘리려고 여러 프로젝트로 나누는 방식은 금지된다.

공식 근거:

- [Quota and Compliance Audits](https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits)
- [Search: list](https://developers.google.com/youtube/data/reference/rest/v3/search/list)
- [Complying with YouTube's Developer Policies](https://developers.google.com/youtube/terms/developer-policies-guide)

### 표시·저장·갱신

- YouTube 콘텐츠를 표시하는 화면은 YouTube가 원천임을 분명히 밝혀야 한다.
- 제목·썸네일 같은 메타데이터를 임의로 바꾸지 않고, 사용 가능한 최신 데이터를 표시해야 한다.
- 비인가 공개 API 데이터는 필요한 범위에서만 임시 저장하며 30일을 넘기기 전에 삭제하거나 갱신한다.
- 과거 자료는 그 시점을 정확히 표시하면 보여줄 수 있다.
- YouTube API 데이터로 만든 자체 지표는 YouTube 자체 지표처럼 보이게 하면 안 된다.

공식 근거:

- [YouTube API Services Developer Policies](https://developers.google.com/youtube/terms/developer-policies)
- [Additional policies for derived metrics and data storage](https://developers.google.com/youtube/terms/derived-metrics-policy)

### 레이더+에 적용할 통제

- 고객 조회 경로는 D1에 이미 저장된 영상만 읽고 신규 검색을 호출하지 않는다.
- 모든 영상에 `publishedAt`, `firstSeenAt`, `lastCollectedAt`를 유지한다.
- `lastCollectedAt`가 30일을 넘은 영상은 고객 화면에서 숨기거나 갱신 대기 상태로 둔다.
- `하루 평균 조회 증가` 옆에 “레이더+ 계산값”과 계산 기간을 표시한다.
- 영상 상세에는 YouTube 원천 표시와 원본 영상 링크를 제공한다.
- 장기 성장 이력 보관은 파생 지표 승인 여부를 확인한 뒤 확정한다.

## 고객 수와 캐시

고객 수는 YouTube 검색 횟수와 직접 연결하지 않는다.

- 고객 1명 또는 1,000명이 같은 30분 캐시를 읽어도 YouTube 신규 검색은 0회가 될 수 있다.
- 별도 정기 수집 작업만 검색 버킷을 사용한다.
- 내부 제한을 하루 20회로 유지하면 공식 기본 검색 한도 100회/일의 20%만 사용한다.
- 고객별 즉시 검색 기능은 공용 키가 아니라 사용자의 개인 키 방식으로 분리하고, 실패 시 공용 키로 자동 전환하지 않는다.

정확한 동시 고객 수는 Cloudflare Worker·D1의 실제 요금제와 응답 크기가 없으므로 `미확인`이다. P2에서 운영 지표를 확인한 뒤 부하 시험으로 정한다.

## NAVER 데이터랩

- 통합 검색어 트렌드 API는 앱별 하루 1,000회다.
- 한 요청에 최대 5개 주제어 그룹, 그룹당 최대 20개 검색어를 넣을 수 있다.
- 결과의 `ratio`는 조회 범위 안에서 최댓값을 100으로 둔 상대값이다. 서로 다른 요청의 값을 절대 검색량처럼 단순 합산하지 않는다.
- 클라이언트 ID와 secret은 서버 요청 헤더에서만 사용하고 브라우저에 노출하지 않는다.

공식 근거:

- [NAVER 통합 검색어 트렌드 API](https://developers.naver.com/docs/serviceapi/datalab/search/search.md)

권장 운영:

- 16개 카테고리를 5개씩 묶으면 한 시점 전체 수집에 최소 4회가 필요하다.
- 하루 6회 정기 수집이면 약 24회/일로, 문서상 1,000회 한도의 2.4%다.
- 고객 화면은 30분 캐시를 읽고 데이터랩을 직접 호출하지 않는다.
- 카테고리·월별 요청의 캐시 키를 정규화해 같은 조회를 합친다.

## Google Trends

- 공식 Google Trends API는 제한된 알파 테스트 단계다.
- 제공 예정 범위는 최근 약 5년, 일·주·월·연 단위, 국가·하위 지역, 요청 간 비교 가능한 일관된 척도다.
- 값은 절대 검색량이 아니라 검색 관심도다.
- 승인 여부, 실제 호출 한도, 상업 서비스의 세부 표시 조건은 현재 계정의 알파 승인 자료가 없으므로 `미확인`이다.

공식 근거:

- [Google Trends API Alpha](https://developers.google.com/search/apis/trends)
- [Introducing the Google Trends API](https://developers.google.com/search/blog/2025/07/trends-api)

권장 운영:

- 승인 전에는 고객 화면의 필수 원천으로 사용하지 않는다.
- `sourceStatus.googleTrends = disabled`를 정상 상태로 허용한다.
- 비공식 스크래핑을 운영 대체 수단으로 채택하지 않는다.
- 승인 후 실제 약관·할당량을 다시 검토하고 `/api/plus` 계약의 상태·캐시 정책만 확장한다.

## P2 이전 체크리스트

- [ ] YouTube 개인정보처리방침·이용약관·Google 개인정보처리방침 링크 배치
- [ ] YouTube 원천 표기와 원본 링크 UI 확정
- [ ] 30일 갱신 또는 비노출 작업 설계
- [ ] 파생 지표 장기 저장 승인 필요 여부 확인
- [ ] NAVER secret 서버 전용 확인
- [ ] Google Trends 알파 승인 결과와 제공 조건 재검토
- [ ] Cloudflare 실제 요금제 기준 부하·비용 시험
