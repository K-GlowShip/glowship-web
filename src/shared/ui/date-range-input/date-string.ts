/** 'YYYY-MM-DD'를 사용자 시간대의 자정 Date로 바꾼다. 형식이 다르면 undefined. */
export const parseDateString = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) {
    return undefined
  }
  const [year, month, day] = match.slice(1).map(Number)
  return new Date(year, month - 1, day)
}

/** Date를 'YYYY-MM-DD'로 바꾼다. toISOString()은 UTC 기준이라 날짜가 하루 밀릴 수 있어 쓰지 않는다. */
export const toDateString = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** 'YYYY-MM-DD'를 화면에 보여줄 'YYYY.MM.DD'로 바꾼다. */
export const formatDisplayDate = (value: string) => value.replaceAll('-', '.')
