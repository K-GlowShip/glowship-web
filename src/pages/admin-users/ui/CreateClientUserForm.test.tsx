import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError, CLIENT_ROLE_CODE, createClientUser } from '@/shared/api'
import { encodeBase64 } from '@/shared/lib/encode-base64'

import { CreateClientUserForm } from './CreateClientUserForm'

vi.mock('@/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/api')>()),
  createClientUser: vi.fn(),
}))

const COMPANY = { companyId: 'company-1', companyName: 'A Beauty' }

const renderForm = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <CreateClientUserForm company={COMPANY} />
    </QueryClientProvider>,
  )

const fill = async ({
  name = '홍길동',
  email = 'lead@client.com',
  password = 'password123',
  role,
}: { name?: string; email?: string; password?: string; role?: '팀원' | '팀장' } = {}) => {
  await userEvent.type(screen.getByLabelText('이름'), name)
  await userEvent.type(screen.getByLabelText('이메일'), email)
  await userEvent.type(screen.getByLabelText('초기 비밀번호'), password)
  if (role) {
    await userEvent.click(screen.getByRole('radio', { name: new RegExp(role) }))
  }
}

const submit = () => userEvent.click(screen.getByRole('button', { name: '계정 만들기' }))

beforeEach(() => {
  vi.mocked(createClientUser).mockResolvedValue({
    userId: 'user-1',
    companyId: COMPANY.companyId,
    email: 'lead@client.com',
    displayName: 'lead@client.com',
    roleCode: CLIENT_ROLE_CODE.CLIENT_LEAD,
    status: 'ACTIVE',
    createdAt: '2026-07-02T00:00:00Z',
  })
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('CreateClientUserForm', () => {
  it('고객사·공백을 뺀 이름과 이메일·Base64 비밀번호를 기본 역할(팀장)로 보낸다', async () => {
    renderForm()

    await fill({ name: ' 홍길동 ', email: '  lead@client.com  ' })
    await submit()

    await waitFor(() =>
      expect(createClientUser).toHaveBeenCalledWith({
        companyId: 'company-1',
        email: 'lead@client.com',
        password: encodeBase64('password123'),
        roleCode: CLIENT_ROLE_CODE.CLIENT_LEAD,
        displayName: '홍길동',
      }),
    )
    expect(await screen.findByText('계정을 만들었습니다')).toBeTruthy()
  })

  it('팀원을 고르면 팀원 역할로 보낸다', async () => {
    renderForm()

    await fill({ role: '팀원' })
    await submit()

    await waitFor(() =>
      expect(createClientUser).toHaveBeenCalledWith(
        expect.objectContaining({ roleCode: CLIENT_ROLE_CODE.CLIENT_MEMBER }),
      ),
    )
  })

  it('처음에는 팀장이 골라져 있다', () => {
    renderForm()

    expect((screen.getByRole('radio', { name: /팀장/ }) as HTMLInputElement).checked).toBe(true)
    expect((screen.getByRole('radio', { name: /팀원/ }) as HTMLInputElement).checked).toBe(false)
  })

  it('입력이 올바르지 않으면 요청을 보내지 않고 칸마다 오류를 보여 준다', async () => {
    renderForm()

    await userEvent.type(screen.getByLabelText('이메일'), 'not-an-email')
    await userEvent.type(screen.getByLabelText('초기 비밀번호'), 'abc')
    await submit()

    expect(createClientUser).not.toHaveBeenCalled()
    expect(screen.getByText('이름을 입력해주세요.')).toBeTruthy()
    expect(screen.getByText('이메일 형식이 올바르지 않습니다.')).toBeTruthy()
    expect(screen.getByText('비밀번호는 영문·숫자 6~16자로 입력해주세요.')).toBeTruthy()
  })

  it('이메일이 이미 있으면(409) 서버 메시지를 이메일 칸에 보여 주고 다시 시도할 수 있다', async () => {
    vi.mocked(createClientUser).mockRejectedValueOnce(
      new ApiError({
        status: 409,
        code: 'EMAIL_DUPLICATED',
        message: '이미 사용 중인 이메일입니다.',
      }),
    )
    renderForm()

    await fill()
    await submit()

    expect(await screen.findByText('이미 사용 중인 이메일입니다.')).toBeTruthy()
    expect(screen.getByLabelText('이메일').getAttribute('aria-invalid')).toBe('true')

    // 이메일을 고치면 서버 오류는 지워지고 다시 보낼 수 있다
    await userEvent.type(screen.getByLabelText('이메일'), 'x')
    expect(screen.queryByText('이미 사용 중인 이메일입니다.')).toBeNull()
  })

  it('권한이 없거나 고객사가 비활성이면 서버 메시지를 폼 아래에 보여 준다', async () => {
    vi.mocked(createClientUser).mockRejectedValueOnce(
      new ApiError({ status: 403, code: 'FORBIDDEN', message: '계정을 만들 권한이 없습니다.' }),
    )
    renderForm()

    await fill()
    await submit()

    expect(await screen.findByText('계정을 만들 권한이 없습니다.')).toBeTruthy()
  })

  it('버튼을 같은 틱에 두 번 눌러도 요청은 한 번만 보낸다', async () => {
    renderForm()
    await fill()
    const button = screen.getByRole('button', { name: '계정 만들기' })

    act(() => {
      button.click()
      button.click()
    })

    await waitFor(() => expect(createClientUser).toHaveBeenCalled())
    expect(createClientUser).toHaveBeenCalledTimes(1)
  })

  it('"다른 계정 만들기"를 누르면 빈 폼으로 돌아온다', async () => {
    renderForm()
    await fill()
    await submit()

    await userEvent.click(await screen.findByRole('button', { name: '다른 계정 만들기' }))

    expect((screen.getByLabelText('이름') as HTMLInputElement).value).toBe('')
    expect((screen.getByLabelText('이메일') as HTMLInputElement).value).toBe('')
    expect((screen.getByRole('radio', { name: /팀장/ }) as HTMLInputElement).checked).toBe(true)
  })
})
