// 숫자는 브라우저 언어 설정과 상관없이 한국식(천 단위 쉼표)으로 보여 준다. 표에서 셀마다 부르므로 formatter를 한 번만 만든다.
const numberFormatter = new Intl.NumberFormat('ko-KR')

/** 숫자를 천 단위 쉼표로. 예: 1234567 -> '1,234,567' */
export const formatNumber = (value: number) => numberFormatter.format(value)
