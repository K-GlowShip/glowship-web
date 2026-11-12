import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'

import {
  type ApiError,
  analysisRunQueries,
  createFinalDecision,
  type CreateFinalDecisionRequest,
  createMemberDraft,
  type CreateMemberDraftRequest,
  decisionQueries,
  delayEventQueries,
  isUnauthorizedError,
} from '@/shared/api'
import { toastError } from '@/shared/ui/toast'

const HTTP_CONFLICT = 409
/** 422 중 화면이 오래돼서 나는 것: 고른 대응안이 이 실행에 없거나 더는 실행할 수 없다 */
const OUTDATED_OPTION_CODES = new Set(['OPTION_NOT_IN_RUN', 'OPTION_NOT_FEASIBLE'])

/**
 * 판단을 남긴 뒤 화면이 서버 상태를 따라가게 한다. 상세의 의견·선택 결과, 목록의 상태·건수, 이력을 다시 읽는다.
 * 409(이미 선택됨·자료 변경·현재 실행이 아님 등)와 대응안이 맞지 않는 422는 화면이 오래된 것이라 실패해도 다시 읽는다.
 * 다시 읽은 결과 상태가 바뀌면 폼이 사라지고 위쪽 상태 안내가 그 이유를 알려 주므로, 이때 폼 안의 오류 문구는 보이지 않을 수 있다.
 */
const useRefreshAfterDecision = () => {
  const queryClient = useQueryClient()
  return () =>
    Promise.all(
      [analysisRunQueries.all, delayEventQueries.all, decisionQueries.all].map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    )
}

const isScreenOutdated = (error: ApiError) =>
  error.status === HTTP_CONFLICT || OUTDATED_OPTION_CODES.has(error.code)

/**
 * 실패했을 때의 공통 처리. 세션이 끝났으면(401) 알리기만 한다. 로그인 페이지로 보내는 일은 전역 처리(`query-client`)가
 * 내 계정을 다시 확인해서 하고, 로그인하면 보던 지연 상세로 돌아온다. 화면이 오래된 경우는 다시 읽는다.
 */
const useHandleDecisionError = () => {
  const refresh = useRefreshAfterDecision()
  return (error: ApiError) => {
    if (isUnauthorizedError(error)) {
      toastError(error.message)
      return
    }
    return isScreenOutdated(error) ? refresh() : undefined
  }
}

/** 팀원의 의견·초안 저장(`POST /analysis-runs/{runId}/drafts`) */
export const useSaveDraft = (runId: string) => {
  const refresh = useRefreshAfterDecision()
  const handleError = useHandleDecisionError()

  return useMutation({
    mutationFn: (body: CreateMemberDraftRequest) => createMemberDraft(runId, body),
    onSuccess: refresh,
    onError: handleError,
  })
}

/**
 * 팀장의 최종 선택(`POST /analysis-runs/{runId}/final-decision`).
 * 같은 대응안·이유로 다시 보낼 때는 같은 `Idempotency-Key`를 써서, 응답을 못 받은 요청이 두 번 기록되지 않게 한다.
 * 내용이나 실행을 바꾸면 새 키를 쓴다(같은 키에 다른 내용을 보내거나 다른 실행에 쓰면 409 `IDEMPOTENCY_KEY_REUSED`).
 */
export const useFinalDecision = (runId: string) => {
  const refresh = useRefreshAfterDecision()
  const handleError = useHandleDecisionError()
  const attempt = useRef<{ signature: string; key: string } | null>(null)

  return useMutation({
    mutationFn: (body: CreateFinalDecisionRequest) => {
      const signature = JSON.stringify({ runId, ...body })
      if (attempt.current?.signature !== signature) {
        attempt.current = { signature, key: crypto.randomUUID() }
      }
      return createFinalDecision(runId, body, attempt.current.key)
    },
    onSuccess: () => {
      attempt.current = null
      return refresh()
    },
    onError: handleError,
  })
}
