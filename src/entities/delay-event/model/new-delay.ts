/**
 * 새 지연으로 보는 감지 시작 시각(UTC ISO 8601). 이 시각 이후에 감지되고 최종 선택이 없는 건이 새 지연이다.
 * 대시보드의 새 지연 알림과 지연 목록의 '새 지연 보기'가 같은 기준을 쓰도록 한 곳에 둔다.
 * 지연 대응 센터 목업에서 이 시각 이후 감지되고 최종 선택이 없는 건이 3건이다.
 * TODO: 명세에 '최근'의 기준(몇 시간 전부터인지)이 없다. 정해지면 그 규칙으로 바꾼다.
 */
export const NEW_DELAY_FROM = '2026-10-20T19:00:00Z'

/** 새 지연으로 보는 기간(시간). 기준 시각에서 이만큼 거슬러 올라간 때부터 감지된 지연이다. */
const NEW_DELAY_WINDOW_HOURS = 24

/**
 * 새 지연의 감지 시작 시각(UTC ISO 8601). 기준 시각(대시보드의 `lastSyncedAt`)에서 24시간 전이다.
 * 서버 현재 시각이 아니라 수집 기준 시각을 쓰는 건 데모(가상 시각)와 실제가 같은 규칙으로 동작하게 하려는 것이다.
 * TODO: 명세에 '최근'의 기준이 없어 정한 값이다. 기획에서 정해지면 바꾼다.
 */
export const getNewDelayFrom = (referenceAt: string) =>
  new Date(new Date(referenceAt).getTime() - NEW_DELAY_WINDOW_HOURS * 60 * 60 * 1000)
    .toISOString()
    .replace(/\.\d{3}Z$/, 'Z')
