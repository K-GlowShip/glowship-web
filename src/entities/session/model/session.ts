import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'glowship:logged-in'

const listeners = new Set<() => void>()

const read = () => {
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

/** 로그인 성공을 기록한다. 토큰은 HttpOnly 쿠키라 읽을 수 없어서, 화면 접근 제어용 표시만 남긴다. */
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

export const useIsLoggedIn = () => useSyncExternalStore(subscribe, read, () => false)
