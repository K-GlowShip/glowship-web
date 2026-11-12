import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError, createFinalDecision, createMemberDraft } from '@/shared/api'
import { toastError } from '@/shared/ui/toast'

import { CLIENT_ROLE, type DelayOption, FEASIBILITY, OPTION_TYPE } from '../model/delay-center'
import { DecisionForm } from './DecisionForm'

vi.mock('@/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/api')>()),
  createMemberDraft: vi.fn(),
  createFinalDecision: vi.fn(),
}))
vi.mock('@/shared/ui/toast', () => ({ toastError: vi.fn(), Toaster: () => null }))

const RUN_ID = 'run-1'

const option: DelayOption = {
  id: 'option-1',
  type: OPTION_TYPE.KEEP_PLAN,
  feasibility: FEASIBILITY.FEASIBLE,
  reasonCode: null,
  expectedArrival: null,
  securableQuantity: null,
  delayInducedRecoveredOrders: null,
  notRecoveredOrders: null,
  itemSecuredBlockedOrders: null,
  recommended: true,
}

const apiError = (status: number, code: string, message = '서버 메시지') =>
  new ApiError({ status, code, message })

const renderForm = (role: typeof CLIENT_ROLE.LEAD | typeof CLIENT_ROLE.MEMBER, selected = option) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <DecisionForm
        runId={RUN_ID}
        role={role}
        selectedOption={selected}
        onlyKeepPlan={false}
        onClearOption={() => undefined}
      />
    </QueryClientProvider>,
  )

const submit = (role: typeof CLIENT_ROLE.LEAD | typeof CLIENT_ROLE.MEMBER) =>
  userEvent.click(
    screen.getByRole('button', {
      name: role === CLIENT_ROLE.LEAD ? '최종 선택' : '의견·초안 저장',
    }),
  )

beforeEach(() => {
  vi.mocked(createMemberDraft).mockResolvedValue({
    memberDraftId: 'draft-1',
    createdAt: '2026-07-02T00:00:00Z',
  })
  vi.mocked(createFinalDecision).mockResolvedValue({
    finalDecisionId: 'decision-1',
    decidedAt: '2026-07-02T00:00:00Z',
    checkedSeq: 1,
    status: 'FINALIZED',
  })
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('DecisionForm 역할별 요청', () => {
  it('팀원은 초안 저장만 호출하고, 앞뒤 공백을 뺀 의견과 대응안을 보낸다', async () => {
    renderForm(CLIENT_ROLE.MEMBER)

    await userEvent.type(screen.getByRole('textbox'), '  항공 전환을 검토합니다  ')
    await submit(CLIENT_ROLE.MEMBER)

    await waitFor(() =>
      expect(createMemberDraft).toHaveBeenCalledWith(RUN_ID, {
        responseOptionId: 'option-1',
        opinionText: '항공 전환을 검토합니다',
      }),
    )
    expect(createFinalDecision).not.toHaveBeenCalled()
    expect(await screen.findByText('의견·초안을 저장했습니다.')).toBeTruthy()
  })

  it('팀원이 의견 없이 대응안만 고르면 opinionText를 보내지 않는다', async () => {
    renderForm(CLIENT_ROLE.MEMBER)

    await submit(CLIENT_ROLE.MEMBER)

    await waitFor(() =>
      expect(createMemberDraft).toHaveBeenCalledWith(RUN_ID, { responseOptionId: 'option-1' }),
    )
  })

  it('팀장은 최종 선택만 호출하고 Idempotency-Key를 함께 보낸다', async () => {
    renderForm(CLIENT_ROLE.LEAD)

    await userEvent.type(screen.getByRole('textbox'), ' 재고 영향이 가장 적습니다 ')
    await submit(CLIENT_ROLE.LEAD)

    await waitFor(() =>
      expect(createFinalDecision).toHaveBeenCalledWith(
        RUN_ID,
        { responseOptionId: 'option-1', reasonText: '재고 영향이 가장 적습니다' },
        expect.any(String),
      ),
    )
    expect(createMemberDraft).not.toHaveBeenCalled()
  })

  it('검증에 실패하면 요청을 보내지 않고 문구를 보여 준다', async () => {
    renderForm(CLIENT_ROLE.LEAD)

    await submit(CLIENT_ROLE.LEAD)

    expect((await screen.findByRole('alert')).textContent).toBe('선택 이유를 입력해주세요.')
    expect(createFinalDecision).not.toHaveBeenCalled()
    expect(createMemberDraft).not.toHaveBeenCalled()
  })
})

describe('최종 선택의 Idempotency-Key', () => {
  const keyOf = (callIndex: number) => vi.mocked(createFinalDecision).mock.calls[callIndex][2]

  it('같은 내용으로 다시 보내면 같은 키를, 내용을 바꾸면 새 키를 쓴다', async () => {
    vi.mocked(createFinalDecision).mockRejectedValue(apiError(500, 'INTERNAL_SERVER_ERROR'))
    renderForm(CLIENT_ROLE.LEAD)

    await userEvent.type(screen.getByRole('textbox'), '이유')
    await submit(CLIENT_ROLE.LEAD)
    await waitFor(() => expect(createFinalDecision).toHaveBeenCalledTimes(1))
    await screen.findByRole('alert')

    await submit(CLIENT_ROLE.LEAD)
    await waitFor(() => expect(createFinalDecision).toHaveBeenCalledTimes(2))
    expect(keyOf(1)).toBe(keyOf(0))

    await userEvent.type(screen.getByRole('textbox'), ' 추가')
    await submit(CLIENT_ROLE.LEAD)
    await waitFor(() => expect(createFinalDecision).toHaveBeenCalledTimes(3))
    expect(keyOf(2)).not.toBe(keyOf(0))
  })
})

describe('실패 처리', () => {
  it('서버가 거절하면 서버 메시지를 폼에 보여 주고 입력칸은 오류로 표시하지 않는다', async () => {
    vi.mocked(createMemberDraft).mockRejectedValue(
      apiError(409, 'EPISODE_CLOSED', '종료된 지연입니다.'),
    )
    renderForm(CLIENT_ROLE.MEMBER)

    await userEvent.type(screen.getByRole('textbox'), '의견')
    await submit(CLIENT_ROLE.MEMBER)

    expect((await screen.findByRole('alert')).textContent).toBe('종료된 지연입니다.')
    expect(screen.getByRole('textbox').getAttribute('aria-invalid')).not.toBe('true')
  })

  it('세션이 끝나면(401) 토스트로 알리고 폼에는 오류를 적지 않는다', async () => {
    vi.mocked(createFinalDecision).mockRejectedValue(
      apiError(401, 'UNAUTHENTICATED', '로그인이 필요합니다.'),
    )
    renderForm(CLIENT_ROLE.LEAD)

    await userEvent.type(screen.getByRole('textbox'), '이유')
    await submit(CLIENT_ROLE.LEAD)

    await waitFor(() => expect(toastError).toHaveBeenCalledWith('로그인이 필요합니다.'))
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
