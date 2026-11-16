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
  /** 서버 없이 데모 계정으로 로그인할 수 있게 한다. 기획자 확인용 배포에서만 켠다. */
  isDemoLogin: import.meta.env.VITE_DEMO_LOGIN === 'true',
  /**
   * 관리자가 담당하는 고객사. 서버가 담당 고객사 목록(`GET /me`의 `assignedCompanies[]`)을 내려주기 전까지 임시로 환경변수로 받는다.
   * MVP는 관리자가 한 곳만 담당한다(명세 D7). 값이 없으면 고객사를 고를 수 없다.
   */
  adminCompanyId: import.meta.env.VITE_ADMIN_COMPANY_ID ?? '',
  adminCompanyName: import.meta.env.VITE_ADMIN_COMPANY_NAME ?? '',
}
