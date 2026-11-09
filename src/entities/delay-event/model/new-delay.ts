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
