import { Check } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

import { CREEP_DURATION_MS, toCreepPosition, toStopPosition } from '../model/analysis-voyage'

/** 컨테이너·엔진 같은 작은 부분에만 쓰는 연한 코랄. 팔레트에 따로 없는 그림 전용 색이다 */
const CORAL = '#f3a48e'

/* ---------- 탈것 ---------- */

/** 작은 컨테이너선. 오른쪽이 뱃머리, 왼쪽 선미에 선실과 굴뚝, 갑판에 납작한 컨테이너 두 줄 */
function ContainerShip({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 56" className={className} aria-hidden="true">
      <rect x="8" y="14" width="18" height="20" rx="2" className="fill-primary-100" />
      <rect x="11" y="18" width="4" height="4" rx="1" className="fill-primary-300" />
      <rect x="18" y="18" width="4" height="4" rx="1" className="fill-primary-300" />
      <rect x="13" y="6" width="7" height="9" rx="1.5" fill={CORAL} />
      <rect x="37" y="18" width="13" height="8" rx="1" className="fill-primary-200" />
      <rect x="51" y="18" width="13" height="8" rx="1" className="fill-primary-400" />
      <rect x="65" y="18" width="13" height="8" rx="1" className="fill-primary-300" />
      <rect x="30" y="26" width="13" height="8" rx="1" className="fill-primary-300" />
      <rect x="44" y="26" width="13" height="8" rx="1" fill={CORAL} />
      <rect x="58" y="26" width="13" height="8" rx="1" className="fill-primary-200" />
      <rect x="72" y="26" width="13" height="8" rx="1" className="fill-primary-400" />
      <path d="M3 34H93L82 51Q81 52 79 52H15Q12 52 11 49Z" className="fill-primary-600" />
      <path d="M3 34H93L90 39H6Z" className="fill-primary-400" />
    </svg>
  )
}

/** 작은 화물기. 오른쪽이 기수, 왼쪽에 꼬리날개, 앞쪽 날개에 코랄 엔진 */
function CargoPlane({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 44" className={className} aria-hidden="true">
      <path d="M12 15H27L22 3Q21 1 18 1H12Z" className="fill-primary-400" />
      <rect x="6" y="13" width="14" height="4" rx="2" className="fill-primary-400" />
      <path
        d="M10 22Q10 14 20 14H74Q86 14 92 22Q86 30 74 30H20Q10 30 10 22Z"
        className="fill-primary-600"
      />
      <rect x="76" y="17" width="9" height="5" rx="2.5" className="fill-primary-200" />
      <rect x="28" y="18" width="14" height="8" rx="1.5" className="fill-primary-500" />
      <path d="M38 26H62L54 40Q53 42 50 42H40Q37 42 38 39Z" className="fill-primary-400" />
      <rect x="41" y="35" width="12" height="6" rx="3" fill={CORAL} />
    </svg>
  )
}

/* ---------- 배경: 물결 띠, 구름 ---------- */

/** 봉우리 두 쌍(폭 50·30·50·30)이라 매끈하지만 규칙적이지 않다. 이어 붙여도 끊기지 않는다 */
const WAVE_PATH =
  'M0 12C15 3 35 3 50 12C60 18 70 18 80 12C95 2 115 2 130 12C140 19 150 19 160 12V120H0Z'
/** 장면 폭(넓은 화면 기준 약 1,800px) + 밀려 가는 한 마디(160px)를 덮는 개수 */
const WAVE_TILE_COUNT = 13

const WAVE_FILL = {
  100: 'fill-primary-100',
  200: 'fill-primary-200',
  300: 'fill-primary-300',
} as const

function WaveBand({
  tone,
  className,
  duration,
  reverse = false,
}: {
  tone: keyof typeof WAVE_FILL
  className: string
  duration: number
  reverse?: boolean
}) {
  return (
    <div className={cn('absolute inset-x-0 overflow-hidden', className)}>
      <div
        className="flex w-max animate-voyage-wave motion-reduce:animate-none"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {Array.from({ length: WAVE_TILE_COUNT }, (_, index) => (
          <svg
            key={index}
            viewBox="0 0 160 120"
            className={cn('h-120pxr w-160pxr shrink-0', WAVE_FILL[tone])}
          >
            <path d={WAVE_PATH} />
          </svg>
        ))}
      </div>
    </div>
  )
}

/** 원 세 개를 겹치고 바닥을 평평하게 자른 구름 한 덩어리 */
const CLOUD_PATH = 'M14 34A8 8 0 1 1 16.1 21.6A14 14 0 0 1 42.9 14.5A10 10 0 1 1 46 34Z'

interface RowCloud {
  /** 한 묶음 너비 기준 위치(%) */
  left: number
  /** 구름 너비(px). 화면이 넓어져도 구름이 늘어나지 않고 간격만 벌어진다 */
  width: number
  /** 띠 높이 기준 바닥에서 띄운 정도(%) */
  bottom: number
}

const FAR_CLOUDS: readonly RowCloud[] = [
  { left: 4, width: 84, bottom: 58 },
  { left: 26, width: 62, bottom: 76 },
  { left: 44, width: 92, bottom: 64 },
  { left: 66, width: 68, bottom: 80 },
  { left: 83, width: 84, bottom: 56 },
]
const NEAR_CLOUDS: readonly RowCloud[] = [
  { left: 0, width: 96, bottom: 8 },
  { left: 13, width: 72, bottom: 14 },
  { left: 30, width: 108, bottom: 8 },
  { left: 46, width: 80, bottom: 16 },
  { left: 61, width: 100, bottom: 8 },
  { left: 76, width: 72, bottom: 14 },
  { left: 88, width: 88, bottom: 8 },
]

/** 같은 구름 묶음을 두 번 이어 붙여 끊김 없이 흐르게 한다 */
function CloudRow({
  clouds,
  fillClassName,
  duration,
  className,
}: {
  clouds: readonly RowCloud[]
  fillClassName: string
  duration: number
  className: string
}) {
  return (
    <div className={cn('absolute inset-x-0 overflow-hidden', className)}>
      <div
        className="absolute bottom-0 left-0 flex h-full w-[200%] animate-voyage-drift motion-reduce:animate-none"
        style={{ animationDuration: `${duration}s` }}
      >
        {[0, 1].map((half) => (
          <div key={half} className="relative h-full w-1/2">
            {clouds.map(({ left, width, bottom }, index) => (
              <svg
                key={index}
                viewBox="2 2 60 33"
                className="absolute"
                style={{ left: `${left}%`, width: `${width / 16}rem`, bottom: `${bottom}%` }}
              >
                <path d={CLOUD_PATH} className={fillClassName} />
              </svg>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- 항로와 정거장 ---------- */

interface RouteProps {
  /** 지금 단계(0부터). 앞의 정거장은 지나온 곳이다 */
  step: number
  stopCount: number
  className: string
}

/** 항로 위 정거장. 지나온 곳은 체크, 아직인 곳은 빈 점이고 지금 정거장은 탈것 아래에 가려진다 */
function Route({ step, stopCount, className }: RouteProps) {
  return (
    <div className={cn('absolute inset-x-0', className)}>
      <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-primary-200" />
      {Array.from({ length: stopCount }, (_, index) => (
        <span
          key={index}
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: toStopPosition(index, stopCount) }}
        >
          {index < step ? (
            <span className="flex size-16pxr items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-10pxr" strokeWidth={3} />
            </span>
          ) : (
            <span className="block size-8pxr rounded-full border-2 border-primary-200 bg-card" />
          )}
        </span>
      ))}
    </div>
  )
}

/**
 * 탈것. 단계가 바뀌면 다음 정거장까지 가서 살짝 넘쳤다가 자리를 잡고(스프링), 자리를 잡은 뒤에는
 * 다음 정거장 쪽으로 천천히 나아간다(`isCreeping`). 다음 정거장에는 서버가 단계를 알려 줘야 닿는다.
 */
function Vehicle({
  step,
  stopCount,
  isCreeping,
  className,
  children,
}: {
  step: number
  stopCount: number
  isCreeping: boolean
  className: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'absolute -translate-x-1/2 transition-[left] motion-reduce:transition-none',
        isCreeping ? 'ease-linear' : 'duration-1100 ease-[cubic-bezier(0.3,1.25,0.45,1)]',
        className,
      )}
      style={{
        left: isCreeping ? toCreepPosition(step, stopCount) : toStopPosition(step, stopCount),
        transitionDuration: isCreeping ? `${CREEP_DURATION_MS}ms` : undefined,
      }}
    >
      {children}
    </span>
  )
}

/* ---------- 장면 ---------- */

interface SceneProps {
  step: number
  stopCount: number
  /** 자리를 잡은 뒤 다음 정거장 쪽으로 천천히 나아가는 중인지 */
  isCreeping: boolean
}

/** 선박: 물결 띠 세 겹 사이를 작은 컨테이너선이 간다. 띠는 서로 다른 속도로 흐르고 배는 느리게 흔들린다 */
export function ShipScene({ step, stopCount, isCreeping }: SceneProps) {
  return (
    <div
      aria-hidden="true"
      className="relative h-150pxr overflow-hidden rounded-card bg-primary-50"
    >
      <WaveBand tone={100} className="bottom-0 h-76pxr" duration={13} />
      <div className="absolute inset-x-56pxr inset-y-0">
        <Route step={step} stopCount={stopCount} className="bottom-48pxr h-16pxr" />
        <Vehicle
          step={step}
          stopCount={stopCount}
          isCreeping={isCreeping}
          className="bottom-30pxr w-112pxr"
        >
          <ContainerShip className="w-full origin-bottom animate-voyage-rock motion-reduce:animate-none" />
        </Vehicle>
      </div>
      <WaveBand tone={200} className="bottom-0 h-46pxr" duration={9} reverse />
      <WaveBand tone={300} className="bottom-0 h-22pxr" duration={7} />
    </div>
  )
}

/**
 * 항공: 멀고 가까운 구름이 다른 속도로 지나가고, 작은 화물기가 항로 위를 가볍게 떠서 간다.
 * 가까운 구름층은 바닥의 같은 색 띠와 한 덩어리로 이어져서, 선박의 물결 띠처럼 패널 아래 끝에서 깔끔하게 끝난다
 */
export function AirScene({ step, stopCount, isCreeping }: SceneProps) {
  return (
    <div
      aria-hidden="true"
      className="relative h-150pxr overflow-hidden rounded-card bg-primary-50"
    >
      <CloudRow
        clouds={FAR_CLOUDS}
        fillClassName="fill-primary-100"
        duration={70}
        className="inset-y-0"
      />
      <CloudRow
        clouds={NEAR_CLOUDS}
        fillClassName="fill-primary-200"
        duration={38}
        className="bottom-0 h-76pxr"
      />
      <span className="absolute inset-x-0 bottom-0 h-14pxr bg-primary-200" />
      <div className="absolute inset-x-56pxr inset-y-0">
        <Route step={step} stopCount={stopCount} className="bottom-78pxr h-16pxr" />
        <Vehicle
          step={step}
          stopCount={stopCount}
          isCreeping={isCreeping}
          className="bottom-60pxr w-112pxr"
        >
          <CargoPlane className="w-full animate-voyage-float motion-reduce:animate-none" />
        </Vehicle>
      </div>
    </div>
  )
}
