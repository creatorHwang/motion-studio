# Motion Studio 1단계 기준선 감사

기준일: 2026-10-29  
검토 자료: `FINDER_MOTION_HANDOFF_2026-10-29_v4.2.zip`  
대상 저장소: `creatorHwang/motion-studio`

## 결론

ZIP의 `current/`와 현재 저장소의 제품 소스는 동일한 v4.2 기준선을 사용한다. ZIP으로 저장소를 덮어쓸 필요가 없다. 현재 저장소에만 있는 차이는 운영에 필요한 의도적인 변경이다.

- Finder 복귀 주소가 `https://finder.thehansu.net/#opportunities`로 구체화됨
- Cloudflare Pages용 `build`, `deploy`, `preview` 명령과 Wrangler 의존성이 추가됨

## 파일 비교

다음 파일은 ZIP과 현재 저장소가 동일하다.

- `styles.css`
- `composer.css`
- `app.js`
- `handoff.js`
- `motions.json`
- `README.md`
- `qa.mjs`
- `visual-qa-v4.mjs`
- `build-package.mjs`
- `tests/handoff.test.mjs`

차이가 있는 파일:

- `index.html`: Finder 복귀 위치만 다름
- `package.json`: Cloudflare Pages 운영 명령만 추가됨

## 이번 실행에서 확인한 결과

- Finder 전달 단위 테스트: 3/3 통과
- `app.js`, `handoff.js` 구문 검사: 통과
- Pages 배포 자산 6개 빌드: 통과
- API 키가 Finder 전달 객체에 포함되지 않는 테스트: 통과
- 전체 브라우저 QA: 40/40 통과
- 24개 카드와 Canvas: 통과
- 320·390·768·1280px 반응형: 통과
- 브라우저 콘솔 오류: 0건

## ZIP에 포함된 기존 검증 근거

- 전체 QA: 40/40 통과
- 24개 카드 확인
- 시각 QA 버전: 4.2.0
- 콘솔 오류: 0건

위 결과는 ZIP에 포함된 기존 기록이며 이번 실행에서 새로 생성한 결과가 아니다.

## QA 재현성 보완

- `playwright`를 개발 의존성으로 선언함
- `npm run qa`, `npm run qa:visual` 명령을 추가함
- 특정 PC의 Chromium 경로를 제거함
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 환경변수 또는 Playwright 기본 경로를 사용함
- 콘솔 오류에 실패한 자원의 URL이 함께 기록되도록 개선함
- 누락된 `favicon.ico` 요청은 빈 데이터 favicon으로 제거함

이 보완 후 설치된 Microsoft Edge를 사용하여 전체 브라우저 QA 40/40을 새로 통과했다.

## 보존 사항

- v4.2 독립 HTML은 비교 기준본으로 유지한다.
- 사용자 작업 중인 `qa.mjs`와 `FINDER_HANDOFF_WORK_ORDER.md`는 수정하거나 커밋하지 않는다.
- 이번 단계에서는 터널 UI와 운영 배포를 변경하지 않는다.
