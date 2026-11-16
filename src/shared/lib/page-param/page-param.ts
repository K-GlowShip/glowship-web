/** 주소의 페이지 번호. 1 이상의 정수가 아니면 1페이지다. */
export const parsePageParam = (value: string | null) => Math.max(1, Math.floor(Number(value)) || 1)
