# THE한수 Motion Preview 3D + Prompt Composer v4.2

## v4.2 time-lapse adjustment

- Increased pedestrian and traffic flow speed well beyond the sun and cloud motion in technique 15.
- Added directional motion trails and multiple opposing pedestrian streams to make compressed time immediately readable.

## v4.1 adjustment

- Removed the unnecessary circular shockwave from technique 22 while preserving its hard cut, brief flash and short camera shake.

## v4.0 visual upgrade

- Replaced stick figures with articulated, shaded low-poly characters.
- Replaced wireframe boxes with solid city architecture, windows, rooftops, road markings and street lights.
- Rebuilt the FPV drone preview as an architectural gate fly-through without a person.
- Upgraded the park scene with layered landscape, dimensional trees and the shared character model.

- 원본 [motion-explainer](https://github.com/showheyohtaki/motion-explainer)의 24개 기법 분류를 기반으로 한 별도 구현입니다.
- 한국어/영어 설명 프롬프트를 각각 복사할 수 있습니다.
- 인물이 꼭 필요한 기법에만 팔이 있는 인물 실루엣을 표시합니다.
- 각 카드의 HTML Canvas 애니메이션은 실제 3D 좌표와 원근 투영을 사용하며 개별 일시정지가 가능합니다.
- J컷/L컷은 오디오가 필수이므로 타임라인으로 표현합니다.
- Dolly/Zoom/Orbit/Crane/Dolly Zoom은 카메라 위치·타깃·화각 상태를 분리해 구현했습니다.
- 24개 기법에 방향·속도·강도·지속시간·분위기·피사체·장면을 조합하는 국문·영문 프롬프트 조합기를 추가했습니다.
- 선택 기법 카드 강조와 선택 속도의 프리뷰 재생 속도 연동을 지원합니다.
- 타임랩스·슬로모션·스피드 램프·프리즈 프레임·랙 포커스는 설명력 재검증 후 동작 장면을 보강했습니다.
- Dolly zoom 수식, Jump cut 동일 구도, Match cut 형태 일치를 24개 전체 의미 검수에서 추가 교정했습니다.
- FPV 드론에서 인물을 제거하고 건물 프레임 통과 장면으로 변경했습니다. J/L컷은 장면 A/B와 클릭 재생형 Web Audio를 추가했습니다.
- 19~21번 전환은 CITY와 PARK 두 장면을 명확히 분리했습니다. 22번은 영어 임팩트 문구 대신 플래시·충격파·화면 흔들림을 사용합니다.
- 실사 렌즈의 왜곡·피사계 심도·센서 특성을 인증하는 물리 시뮬레이터가 아니라, 핵심 차이를 이해하기 위한 교육용 도식입니다.

## 배포
정적 파일(`index.html`, `styles.css`, `app.js`)로 동작합니다. 폴더 전체를 정적 호스팅에 배포할 수 있습니다.

## 검증

```text
npm test
npm run check
npm run qa
npm run qa:visual
```

브라우저 실행 파일을 자동으로 찾지 못하는 환경에서는 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`에 Chromium 또는 Edge 실행 파일 경로를 지정합니다. Finder 전달까지 검사할 때는 HTTP 정적 서버를 실행하고 `QA_BASE_URL`에 해당 주소를 지정합니다.

## 라이선스/출처
기법 목록 참고: showheyohtaki/motion-explainer (MIT). 본 앱의 Canvas 시각화와 프롬프트는 별도 구현입니다.
