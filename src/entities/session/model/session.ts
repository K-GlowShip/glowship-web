import { useQuery } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'

import { isUnauthorizedError, meQueryOptions } from '@/shared/api'
import { env } from '@/shared/config'

const STORAGE_KEY = 'glowship:logged-in'

export const SESSION_STATUS = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  /** 로그인 여부를 알 수 없는 경우. 서버 오류·네트워크 오류라 다시 시도하면 알 수 있다. */
  ERROR: 'error',
} as const

const listeners = new Set<() => void>()

// 데모 로그인은 서버 쿠키가 없어서 브라우저에 표시를 남긴다. 실제 로그인은 아무것도 저장하지 않는다.
export const isDemoSession = () => {
  if (!env.isDemoLogin) {
    return false
  }
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

const emit = () => listeners.forEach((listener) => listener())

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

/** 데모 로그인 성공을 기록한다. 실제 로그인은 호출하지 않는다(쿠키가 세션이고 `GET /me`로 확인한다). */
export const markLoggedIn = () => {
  try {
    localStorage.setItem(STORAGE_KEY, 'true')
  } catch {
    // 저장소를 쓸 수 없으면 새로고침 시 다시 로그인한다
  }
  emit()
}

export const clearSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // 저장소를 쓸 수 없으면 지울 것도 없다
  }
  emit()
}

interface SessionSnapshot {
  isDemoSession: boolean
  hasMe: boolean
  isPending: boolean
  error: unknown
}

const getSessionStatus = ({ isDemoSession, hasMe, isPending, error }: SessionSnapshot) => {
  if (isDemoSession) {
    return SESSION_STATUS.AUTHENTICATED
  }
  // 세션이 끝난 뒤의 재조회(예: 창 포커스)가 401이면 이전 응답이 남아 있어도 로그아웃 상태다
  if (isUnauthorizedError(error)) {
    return SESSION_STATUS.UNAUTHENTICATED
  }
  if (hasMe) {
    return SESSION_STATUS.AUTHENTICATED
  }
  return isPending ? SESSION_STATUS.LOADING : SESSION_STATUS.ERROR
}

/**
 * 로그인 상태. 데모 로그인이면 저장된 표시로, 아니면 `GET /me` 결과로 판단한다.
 * HttpOnly 쿠키는 프론트가 읽을 수 없어서, 서버가 쿠키를 받아들이는지 물어보는 방식이다.
 * 401만 로그아웃 상태로 보고, 그 밖의 오류(5xx·네트워크)는 `ERROR`로 구분해 다시 시도하게 한다.
 */
export const useSession = () => {
  const isDemo = useSyncExternalStore(subscribe, isDemoSession, () => false)
  const {
    data: me,
    error,
    isPending,
    isFetching,
    refetch,
  } = useQuery({ ...meQueryOptions, enabled: !isDemo })

  return {
    status: getSessionStatus({ isDemoSession: isDemo, hasMe: Boolean(me), isPending, error }),
    me,
    error,
    retry: () => void refetch(),
    isRetrying: isFetching,
  }
}
