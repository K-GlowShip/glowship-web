import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'

import {
  analysisRunQueries,
  createFinalDecision,
  type CreateFinalDecisionRequest,
  createMemberDraft,
  type CreateMemberDraftRequest,
  decisionQueries,
  delayEventQueries,
  isApiError,
} from '@/shared/api'

const HTTP_CONFLICT = 409

/**
 * 판단을 남긴 뒤 화면이 서버 상태를 따라가게 한다. 상세의 의견·선택 결과, 목록의 상태·건수, 이력을 다시 읽는다.
 * 409(이미 선택됨·자료 변경·현재 실행이 아님 등)는 화면이 오래된 것이라 실패해도 다시 읽는다.
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

const isConflict = (error: unknown) => isApiError(error) && error.status === HTTP_CONFLICT

/** 팀원의 의견·초안 저장(`POST /analysis-runs/{runId}/drafts`) */
export const useSaveDraft = (runId: string) => {
  const refresh = useRefreshAfterDecision()

  return useMutation({
    mutationFn: (body: CreateMemberDraftRequest) => createMemberDraft(runId, body),
    onSuccess: refresh,
    onError: (error) => (isConflict(error) ? refresh() : undefined),
  })
}

/**
 * 팀장의 최종 선택(`POST /analysis-runs/{runId}/final-decision`).
 * 같은 대응안·이유로 다시 보낼 때는 같은 `Idempotency-Key`를 써서, 응답을 못 받은 요청이 두 번 기록되지 않게 한다.
 * 내용이나 실행을 바꾸면 새 키를 쓴다(같은 키에 다른 내용을 보내거나 다른 실행에 쓰면 409 `IDEMPOTENCY_KEY_REUSED`).
 */
export const useFinalDecision = (runId: string) => {
  const refresh = useRefreshAfterDecision()
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
    onError: (error) => (isConflict(error) ? refresh() : undefined),
  })
}
