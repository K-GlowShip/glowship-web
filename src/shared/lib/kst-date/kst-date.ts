// 서버는 시각을 항상 UTC(ISO 8601, 'Z')로 주고받고, 화면은 한국 시간(KST)으로 보여 준다.
// 브라우저 시간대에 기대지 않도록 시간대를 Asia/Seoul로 명시해서 변환한다.
const KST_TIME_ZONE = 'Asia/Seoul'

const kstFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: KST_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

const getKstParts = (isoUtc: string) => {
  const date = new Date(isoUtc)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }
  const parts = Object.fromEntries(
    kstFormatter.formatToParts(date).map(({ type, value }) => [type, value]),
  )
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
  }
}

/** UTC 시각을 한국 날짜 'YYYY-MM-DD'로 바꾼다. 조회 기간(KST 날짜)과 비교할 때 쓴다. */
export const formatYYYYMMDD = (isoUtc: string) => {
  const parts = getKstParts(isoUtc)
  return parts ? `${parts.year}-${parts.month}-${parts.day}` : ''
}

/** UTC 시각을 한국 시간 'YYYY.MM.DD HH:mm'으로 바꾼다. (예: '2026-10-21T00:24:00Z' -> '2026.10.21 09:24') */
export const formatYYYYMMDDHHmm = (isoUtc: string) => {
  const parts = getKstParts(isoUtc)
  return parts ? `${parts.year}.${parts.month}.${parts.day} ${parts.hour}:${parts.minute}` : ''
}

const KST_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const KST_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/

// Date는 '2026-02-30'을 3월 2일로 넘겨 계산하므로, 날짜와 시각이 실제로 있는 값인지 직접 확인한다.
const isExistingDateTime = (dateTime: string) => {
  const [year, month, day, hour, minute, second] = dateTime.split(/[-T:]/).map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    hour < 24 &&
    minute < 60 &&
    second < 60
  )
}

/**
 * 한국 시간 'YYYY-MM-DDTHH:mm'(초는 생략 가능)을 서버로 보낼 UTC 시각으로 바꾼다.
 * (예: '2026-10-21T09:24' -> '2026-10-21T00:24:00Z') 형식이 올바르지 않거나 없는 날짜면 ''.
 */
export const kstToUtc = (kstDateTime: string) => {
  if (!KST_DATE_TIME_PATTERN.test(kstDateTime)) {
    return ''
  }
  const withSeconds = kstDateTime.length === 16 ? `${kstDateTime}:00` : kstDateTime
  if (!isExistingDateTime(withSeconds)) {
    return ''
  }
  // 한국은 서머타임이 없어 항상 +09:00이다.
  return new Date(`${withSeconds}+09:00`).toISOString().replace(/\.\d{3}Z$/, 'Z')
}

/** 한국 날짜 'YYYY-MM-DD'의 시작(00:00:00 KST)을 UTC 시각으로. (예: '2026-10-21' -> '2026-10-20T15:00:00Z') */
export const toUtcDayStart = (kstDate: string) =>
  KST_DATE_PATTERN.test(kstDate) ? kstToUtc(`${kstDate}T00:00:00`) : ''

/**
 * 'YYYY-MM-DD'에 일수를 더한다. 브라우저 시간대에 기대지 않고 달력 날짜(UTC 기준 문자열)로만 계산한다.
 * 형식이 올바르지 않으면 ''. (예: ('2026-10-31', 1) -> '2026-11-01')
 */
export const addDays = (date: string, days: number) => {
  if (!KST_DATE_PATTERN.test(date)) {
    return ''
  }
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}

/**
 * 기간 필터의 끝(`to`)으로 보낼 시각. 한국 날짜 'YYYY-MM-DD'의 **다음 날** 시작(00:00:00 KST)을 UTC 시각으로.
 * 서버의 `[from, to)`는 `to`를 포함하지 않으므로, 종료일을 포함하려면 종료일 + 1일을 보낸다.
 * (예: '2026-10-21' -> '2026-10-21T15:00:00Z')
 */
export const toUtcNextDayStart = (kstDate: string) => toUtcDayStart(addDays(kstDate, 1))

const kstLongDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: KST_TIME_ZONE,
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
})

/** UTC 시각을 한국 날짜 '2026년 10월 21일 수요일'로 바꾼다. 올바르지 않은 값이면 ''. */
export const formatKoreanLongDate = (isoUtc: string) => {
  const date = new Date(isoUtc)
  return Number.isNaN(date.getTime()) ? '' : kstLongDateFormatter.format(date)
}

/** UTC 시각을 한국 시간 'HH:mm'으로 바꾼다. (예: '2026-10-21T00:30:00Z' -> '09:30') */
export const formatHHmm = (isoUtc: string) => formatYYYYMMDDHHmm(isoUtc).slice(-5)
