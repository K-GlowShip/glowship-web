export const DEFAULT_API_VERSION = 'v1'

const VERSION_SEGMENT = /^v\d+$/
const ABSOLUTE_URL = /^https?:\/\//

/**
 * 요청 경로에 API 버전을 붙인다.
 * - 버전이 없으면 기본 버전을 붙인다. (`/admins` -> `/v1/admins`)
 * - 이미 버전이 있으면 그대로 둔다. (`/v2/admins` -> `/v2/admins`)
 * - 절대 URL은 건드리지 않는다.
 */
export const getVersionUrl = (url: string) => {
  if (ABSOLUTE_URL.test(url)) return url

  const parts = url.split('/')
  if (parts.length > 1 && VERSION_SEGMENT.test(parts[1])) return url

  return `/${DEFAULT_API_VERSION}${url}`
}
