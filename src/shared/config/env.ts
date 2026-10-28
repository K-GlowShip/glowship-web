function getEnv(key: keyof ImportMetaEnv) {
  const value = import.meta.env[key]

  if (!value) {
    throw new Error(
      `환경변수 ${key}가 설정되지 않았습니다. .env.example을 참고해 .env를 만들어주세요.`,
    )
  }

  return value
}

export const env = {
  apiBaseUrl: getEnv('VITE_API_BASE_URL'),
}
