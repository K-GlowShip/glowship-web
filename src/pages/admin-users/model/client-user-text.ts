import { CLIENT_ROLE_CODE, type ClientRoleCode } from '@/shared/api'

/** 이메일·표시 이름의 최대 길이. 서버 요청 형식과 같다(명세 4.1 `POST /admin/users`) */
export const EMAIL_MAX_LENGTH = 50
export const DISPLAY_NAME_MAX_LENGTH = 50

/** 입력칸은 최대 길이보다 조금 더 받아서, 넘었을 때 글자가 조용히 잘리지 않고 오류 문구가 보이게 한다 */
export const INPUT_LENGTH_MARGIN = 20

/** 서버의 이메일 형식(`ClientUserCreateRequest.email`)과 같다 */
export const EMAIL_PATTERN = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/

/** 초기 비밀번호는 영문·숫자 6~16자다(명세 D6). 서버는 Base64를 풀어서 검사한다 */
export const PASSWORD_PATTERN = /^[A-Za-z0-9]{6,16}$/

export const CLIENT_USER_ERROR = {
  EMAIL_REQUIRED: '이메일을 입력해주세요.',
  EMAIL_TOO_LONG: `이메일은 ${EMAIL_MAX_LENGTH}자 이하로 입력해주세요.`,
  EMAIL_INVALID: '이메일 형식이 올바르지 않습니다.',
  PASSWORD_REQUIRED: '초기 비밀번호를 입력해주세요.',
  PASSWORD_INVALID: '비밀번호는 영문·숫자 6~16자로 입력해주세요.',
  DISPLAY_NAME_REQUIRED: '이름을 입력해주세요.',
  DISPLAY_NAME_TOO_LONG: `이름은 ${DISPLAY_NAME_MAX_LENGTH}자 이하로 입력해주세요.`,
} as const

/** 서버가 내려주는 오류 코드 중 폼의 특정 칸에 보여 줄 것 */
export const CLIENT_USER_SERVER_ERROR = {
  EMAIL_DUPLICATED: 'EMAIL_DUPLICATED',
  INVALID_PASSWORD_FORMAT: 'INVALID_PASSWORD_FORMAT',
} as const

/** 만들 수 있는 역할과 그 역할이 하는 일(명세 6절). 관리자는 팀원·팀장 계정을 만들 수 있다 */
export const CLIENT_ROLE_OPTIONS: readonly {
  code: ClientRoleCode
  label: string
  description: string
}[] = [
  {
    code: CLIENT_ROLE_CODE.CLIENT_LEAD,
    label: '팀장',
    description: '지연을 조회하고 재분석을 요청하며 최종 선택을 합니다.',
  },
  {
    code: CLIENT_ROLE_CODE.CLIENT_MEMBER,
    label: '팀원',
    description: '지연을 조회하고 재분석을 요청하며 의견·초안을 저장합니다.',
  },
]
