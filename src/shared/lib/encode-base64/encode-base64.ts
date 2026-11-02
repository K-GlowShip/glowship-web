/** 문자열을 UTF-8 Base64로 인코딩한다. `btoa()`와 달리 한글 등 비영문 문자도 에러 없이 처리한다. */
export const encodeBase64 = (value: string) => {
  const bytes = new TextEncoder().encode(value)
  return btoa(String.fromCharCode(...bytes))
}
