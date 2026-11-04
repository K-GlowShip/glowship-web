import { useMutation } from '@tanstack/react-query'

const MOCK_DELAY_MS = 1500

// TODO: POST /analysis-runs/{runId}/reanalysis 요청으로 교체 (요청 함수는 shared/api/endpoints에 추가). 지금은 응답 지연만 흉내 낸다
export const useReanalysis = () =>
  useMutation({
    mutationFn: () => new Promise<void>((resolve) => setTimeout(resolve, MOCK_DELAY_MS)),
  })
