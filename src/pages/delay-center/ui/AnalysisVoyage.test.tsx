import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TRANSPORT_MODE, type TransportMode } from '@/entities/delay-event'
import { TooltipProvider } from '@/shared/ui/tooltip'

import { ANALYSIS_VOYAGE } from '../model/delay-center-text'
import { AnalysisVoyage } from './AnalysisVoyage'

// jsdom에는 matchMedia가 없다. '동작 줄이기'가 꺼진 환경으로 둔다
beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: false }))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const renderVoyage = ({
  transportMode = TRANSPORT_MODE.OCEAN,
  step = 1,
  hasPreviousRun = true,
}: {
  transportMode?: TransportMode
  step?: number | null
  hasPreviousRun?: boolean
} = {}) =>
  render(
    <TooltipProvider>
      <AnalysisVoyage transportMode={transportMode} step={step} hasPreviousRun={hasPreviousRun} />
    </TooltipProvider>,
  )

describe('AnalysisVoyage', () => {
  it('지금 단계의 제목과 설명을 보여 주고 그 정거장을 현재로 표시한다', () => {
    renderVoyage({ step: 2 })

    expect(screen.getByText(ANALYSIS_VOYAGE.STEPS[2].title)).toBeTruthy()
    expect(screen.getByText(ANALYSIS_VOYAGE.STEPS[2].detail)).toBeTruthy()
    expect(
      screen
        .getByRole('button', { name: ANALYSIS_VOYAGE.STEPS[2].label })
        .getAttribute('aria-current'),
    ).toBe('step')
    expect(
      screen
        .getByRole('button', { name: ANALYSIS_VOYAGE.STEPS[0].label })
        .getAttribute('aria-current'),
    ).toBeNull()
  })

  it('단계를 모르면 첫 단계로 본다', () => {
    renderVoyage({ step: null })

    expect(screen.getByText(ANALYSIS_VOYAGE.STEPS[0].title)).toBeTruthy()
  })

  it('운송 수단에 맞게 해상·항공을 표시한다', () => {
    const { unmount } = renderVoyage({ transportMode: TRANSPORT_MODE.OCEAN })
    expect(screen.getByText('해상 운송 · 분석 중')).toBeTruthy()
    unmount()

    renderVoyage({ transportMode: TRANSPORT_MODE.AIR })
    expect(screen.getByText('항공 운송 · 분석 중')).toBeTruthy()
  })

  it('이전 분석이 있을 때만 이력에 남는다는 안내를 보여 준다', () => {
    const { unmount } = renderVoyage({ hasPreviousRun: true })
    expect(screen.queryByText(ANALYSIS_VOYAGE.HISTORY)).toBeTruthy()
    unmount()

    renderVoyage({ hasPreviousRun: false })
    expect(screen.queryByText(ANALYSIS_VOYAGE.HISTORY)).toBeNull()
  })

  it('정거장 이름에 포커스하면 그 단계가 하는 일을 알려 준다', async () => {
    renderVoyage({ step: 0 })

    await userEvent.tab()
    await userEvent.hover(screen.getByRole('button', { name: ANALYSIS_VOYAGE.STEPS[3].label }))

    expect((await screen.findAllByText(ANALYSIS_VOYAGE.STEPS[3].detail)).length).toBeGreaterThan(0)
  })
})
