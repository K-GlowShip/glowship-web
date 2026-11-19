import { useEffect, useRef, useState } from 'react'

import { TRANSPORT_MODE, TRANSPORT_MODE_LABEL, type TransportMode } from '@/entities/delay-event'
import { cn } from '@/shared/lib/cn'
import { prefersReducedMotion } from '@/shared/lib/reduced-motion'
import { Tooltip } from '@/shared/ui/tooltip'

import { toStopPosition } from '../model/analysis-voyage'
import { ANALYSIS_VOYAGE } from '../model/delay-center-text'
import { AirScene, ShipScene } from './VoyageScenes'

const STEPS = ANALYSIS_VOYAGE.STEPS
const STOP_COUNT = STEPS.length
/** 단계가 바뀌고 탈것이 정거장에 자리를 잡는 데 걸리는 시간(스프링 이동 1.1초)보다 조금 길게 기다린 뒤 나아가기 시작한다 */
const SETTLE_MS = 1_200

/** 탈것이 정거장 하나를 지나는 데 걸리는 시간. 스프링 이동(1.1초)이 끝날 무렵 다음 정거장으로 출발한다 */
const HOP_MS = 1_100

/**
 * 화면에 보이는 단계. 서버는 일정 간격으로 읽어 오기 때문에 그 사이에 단계가 두세 개 넘어가 있을 수 있다.
 * 그대로 따르면 탈것이 첫 정거장에서 마지막 정거장으로 갑자기 날아가므로, 정거장을 하나씩 지나서 따라잡는다.
 * 단계가 줄어들면(재분석으로 처음부터 다시) 바로 맞추고, '동작 줄이기'면 따라잡지 않고 바로 맞춘다.
 */
const useCatchUpStep = (target: number) => {
  const [shown, setShown] = useState(target)
  // 이미 따라잡는 중이면 다음 정거장까지 간격을 두고, 막 시작할 때는 바로 출발한다
  const isHoppingRef = useRef(false)

  // 렌더 중에 맞춘다: 단계가 줄었거나 '동작 줄이기'면 따라잡을 필요 없이 바로 보이는 단계를 바꾼다
  if (shown !== target && (target < shown || prefersReducedMotion())) {
    setShown(target)
  }

  useEffect(() => {
    if (shown >= target) {
      isHoppingRef.current = false
      return
    }
    const timer = setTimeout(
      () => {
        isHoppingRef.current = true
        setShown((previous) => previous + 1)
      },
      isHoppingRef.current ? HOP_MS : 0,
    )
    return () => clearTimeout(timer)
  }, [shown, target])

  return shown
}

/** 자리를 잡은 뒤 다음 정거장 쪽으로 천천히 나아가야 하는지. 마지막 정거장이거나 '동작 줄이기'면 움직이지 않는다 */
const useCreeping = (step: number) => {
  const [creepingStep, setCreepingStep] = useState<number | null>(null)

  useEffect(() => {
    if (step >= STOP_COUNT - 1 || prefersReducedMotion()) {
      return
    }
    const timer = setTimeout(() => setCreepingStep(step), SETTLE_MS)
    return () => clearTimeout(timer)
  }, [step])

  return creepingStep === step
}

interface AnalysisVoyageProps {
  transportMode: TransportMode
  /** 지금 분석 단계(0부터). 모르면 첫 단계로 본다 */
  step: number | null
  /** 이전 분석이 있는지. 있을 때만 "이력에 남아 있어요" 안내를 보여 준다 */
  hasPreviousRun: boolean
}

/**
 * 분석이 도는 동안의 대기 화면. 분석 네 단계가 작은 항해의 정거장 네 곳이고, 단계가 바뀌면 선박(해상)이나 화물기(항공)가
 * 다음 정거장으로 간다. 정거장 이름에 마우스를 올리거나 포커스하면 그 단계가 하는 일이 뜬다.
 */
export function AnalysisVoyage({ transportMode, step, hasPreviousRun }: AnalysisVoyageProps) {
  const target = Math.min(Math.max(step ?? 0, 0), STOP_COUNT - 1)
  const current = useCatchUpStep(target)
  // 따라잡는 동안에는 다음 정거장 쪽으로 천천히 나아가지 않고, 서버가 알려 준 단계에 닿은 뒤에 나아간다
  const isCreeping = useCreeping(current) && current === target

  return (
    <section role="status" className="flex flex-col gap-24pxr py-16pxr">
      <p className="sr-only">
        {STOP_COUNT}단계 중 {target + 1}단계 · {STEPS[target].label}
      </p>

      <div className="flex flex-col items-center gap-6pxr text-center">
        <p className="text-caption text-primary-700">
          {TRANSPORT_MODE_LABEL[transportMode]} 운송 · 분석 중
        </p>
        <h3 className="text-h2 font-bold">{ANALYSIS_VOYAGE.HEADLINE}</h3>
        <p key={current} className="animate-rise text-b1 font-bold text-primary">
          {STEPS[current].title}
        </p>
        <p key={`detail-${current}`} className="animate-rise text-b2 text-muted-foreground">
          {STEPS[current].detail}
        </p>
      </div>

      <div className="flex w-full flex-col gap-12pxr">
        {transportMode === TRANSPORT_MODE.AIR ? (
          <AirScene step={current} stopCount={STOP_COUNT} isCreeping={isCreeping} />
        ) : (
          <ShipScene step={current} stopCount={STOP_COUNT} isCreeping={isCreeping} />
        )}
        <div className="px-56pxr">
          <StopLabels step={current} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2pxr text-center text-caption text-muted-foreground">
        <p>{ANALYSIS_VOYAGE.EXPECTATION}</p>
        {hasPreviousRun && <p>{ANALYSIS_VOYAGE.HISTORY}</p>}
      </div>
    </section>
  )
}

/** 정거장 이름. 터치 화면에서는 툴팁이 열리지 않지만, 지금 단계의 설명은 위쪽 글에 이미 있다 */
function StopLabels({ step }: { step: number }) {
  return (
    <ol className="relative h-20pxr text-caption">
      {STEPS.map(({ label, detail }, index) => (
        <li
          key={label}
          className="absolute -translate-x-1/2 whitespace-nowrap"
          style={{ left: toStopPosition(index, STOP_COUNT) }}
        >
          <Tooltip content={detail}>
            <button
              type="button"
              aria-current={index === step ? 'step' : undefined}
              className={cn(
                'cursor-default rounded-control px-4pxr outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30',
                index === step && 'font-bold text-primary',
                index < step && 'text-foreground',
                index > step && 'text-disabled-foreground',
              )}
            >
              {label}
            </button>
          </Tooltip>
        </li>
      ))}
    </ol>
  )
}
