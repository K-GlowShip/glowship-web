# API 클라이언트 가이드

백엔드 요청은 `shared/api`의 `fetcher`(axios 인스턴스)와 `API`(요청 메서드 모음)로 보냅니다. 파일 위치는 [폴더 구조](folder-structure.md)의 "API와 환경변수"를 참고하세요.

## fetcher와 API

- `fetcher`는 서버 주소(`VITE_API_BASE_URL`)와 `/api`, 쿠키 전송(`withCredentials`), 타임아웃(10초)이 설정된 axios 인스턴스입니다. 설정은 [fetcher.ts](../src/shared/api/fetcher.ts)에 있습니다.
- 요청 함수에서는 `fetcher`를 직접 쓰지 않고 `API.get/post/put/patch/delete`를 사용합니다. 응답 본문(`data`)만 반환합니다.
- 서버가 쿠키로 인증하므로 요청마다 쿠키를 보냅니다. 서버 `.env`의 `CORS_ORIGINS`에 웹 개발 주소가 등록되어 있어야 합니다.

## API 버전

서버 경로는 `/api/{버전}/...` 형태입니다. `fetcher`가 서버 주소와 `/api`를 붙이고, 버전은 [version.ts](../src/shared/api/version.ts)의 `getVersionUrl`이 요청 경로에 붙입니다.

| 요청 경로 | 실제 요청 |
| --- | --- |
| `/signup` | `/api/v1/signup` (버전이 없으면 기본 버전 `v1`) |
| `/v2/signup` | `/api/v2/signup` (경로에 적은 버전을 그대로 사용) |

- 기본 버전은 `DEFAULT_API_VERSION`입니다. 서버가 새 버전을 기본으로 바꾸면 이 값만 바꿉니다.
- 일부 요청만 다른 버전을 쓰려면 경로 앞에 버전을 적습니다. (`ENDPOINT`에 `'/v2/...'`로 정의)
- 절대 URL(`http://...`)은 변경하지 않습니다.

## 에러 처리

실패한 요청은 항상 `ApiError`로 던져집니다. ([error.ts](../src/shared/api/error.ts))

| 필드 | 설명 |
| --- | --- |
| `status` | HTTP 상태 코드. 서버 응답이 없으면(네트워크 오류, 타임아웃) `null` |
| `code` | 서버가 내려준 에러 코드(예: `EMAIL_DUPLICATED`). 서버 응답이 없거나 형식이 다르면 클라이언트 코드 |
| `message` | 사용자에게 보여줄 수 있는 메시지 |
| `requestId` | 서버 로그 추적용 요청 ID. 서버 응답이 없으면 `null` |

- 서버의 공통 에러 응답 형식은 `{ code, message, request_id }`입니다. (glowship-server `ErrorResponse`)
- 클라이언트 에러(`CLIENT_ERROR`, 코드와 메시지를 함께 관리)는 `NETWORK_ERROR`(연결 실패), `TIMEOUT`(시간 초과), `UNKNOWN_ERROR`(서버 공통 형식이 아닌 응답)입니다.
- `isApiError(error)`로 `ApiError`인지 구분합니다.

```ts
try {
  await API.post(ENDPOINT.AUTH.SIGNUP, body)
} catch (error) {
  if (isApiError(error) && error.code === 'EMAIL_DUPLICATED') {
    // 이메일 중복 안내
  }
}
```

## TanStack Query

[query-client.ts](../src/app/entrypoint/query-client.ts)에서 기본 옵션을 설정합니다.

- `error`는 `ApiError` 타입으로 추론됩니다.
- 조회(`useQuery`)는 4xx 응답을 다시 요청해도 결과가 같으므로 재시도하지 않고, 네트워크 오류와 5xx만 최대 2번 재시도합니다.
- 쓰기(`useMutation`)는 같은 요청이 서버에 중복으로 들어가지 않도록 재시도하지 않습니다.

## 요청 경로 상수

- 요청 경로는 문자열을 직접 쓰지 않고 [paths.ts](../src/shared/api/paths.ts)의 `ENDPOINT`를 사용합니다. 서버 주소, `/api`, 기본 버전은 `fetcher`가 붙이므로 상수에는 포함하지 않습니다.
- 실제 백엔드 API 명세에 있는 경로만 추가합니다.
- 기본 버전(`v1`)이 아닌 요청은 `ENDPOINT` 상수에 버전을 직접 적습니다. 요청마다 버전이 다를 수 있어서, 해당 경로만 `'/v2/...'`로 적고 나머지는 그대로 둡니다. 요청 코드에서는 버전을 신경 쓰지 않고 상수만 씁니다.
- 화면 경로(`/dashboard` 등)는 `shared/config`의 `ROUTES`를 사용합니다. ([routes.ts](../src/shared/config/routes.ts))

```ts
export const ENDPOINT = {
  AUTH: {
    SIGNUP: '/signup', // 버전 없음 -> /api/v1/signup
    LOGIN: '/v2/login', // v2만 직접 적음 -> /api/v2/login
  },
} as const
```

## 요청 함수 작성 예시

- 요청 함수는 `shared/api/endpoints/`에 백엔드 리소스별 파일로 만듭니다. 실제 백엔드 API 명세에 있는 요청만 만듭니다.
- query가 요청을 취소할 수 있도록 `signal`을 `API`의 `config`로 넘깁니다.

```ts
// shared/api/endpoints/delay-events.ts
import { queryOptions } from '@tanstack/react-query'

import { API } from '../fetcher'

export interface DelayEvent {
  id: string
}

export const delayEventQueries = {
  list: () =>
    queryOptions({
      queryKey: ['delay-events'],
      queryFn: ({ signal }) => API.get<DelayEvent[]>('/delay-events', { signal }),
    }),
}
```
