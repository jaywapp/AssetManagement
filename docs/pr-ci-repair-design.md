# PR CI 실패 수정 설계

Node 기본 파일 API로 lib 아래 *.test.ts를 재귀 탐색하고 실제 경로를 tsx 테스트 실행기에 전달한다. 빈 목록은 실패 처리한다. 의존성·워크플로·제품 동작은 변경하지 않는다.

검증: npm test 전체 9개 및 CI lint 명령, 새 PR HEAD의 GitHub validate 성공 확인.
