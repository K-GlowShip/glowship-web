import { useId } from 'react'

import { TRANSPORT_MODE } from '@/shared/api'
import { cn } from '@/shared/lib/cn'

import { MAP_ARCS, MAP_PORTS, ROUTE_MAP_HEIGHT, ROUTE_MAP_WIDTH } from '../model/hero-route'

/** 운송 수단별 호·점 색. 해상은 파랑, 항공은 보라(여정 선과 같은 약속) */
const ARC_CLASS: Record<string, string> = {
  [TRANSPORT_MODE.OCEAN]: 'stroke-info/45',
  [TRANSPORT_MODE.AIR]: 'stroke-primary/45',
}
const DOT_CLASS: Record<string, string> = {
  [TRANSPORT_MODE.OCEAN]: 'fill-info',
  [TRANSPORT_MODE.AIR]: 'fill-primary',
}
const UNKNOWN_ARC_CLASS = 'stroke-primary/45'
const UNKNOWN_DOT_CLASS = 'fill-primary'

/** 격자선 간격과 장식용 좌표 눈금. 한국(126°E)에서 미국 동부(75°W)까지 태평양을 가운데 둔 고정 라벨이다 */
const GRID_STEP = 60
/**
 * 격자는 그림 왼쪽 밖(글자 아래)으로 사실상 끝없이 이어진다. 그림이 오른쪽에 맞춰지므로 면이 아무리 넓어도
 * (브라우저 배율을 줄여도) 왼쪽 끝까지 선이 닿아야 한다. 실제로는 면의 overflow-hidden이 자른다
 */
const GRID_EXTENT = 100_000
const LONGITUDE_TICKS = [
  { x: 150, label: '126°E' },
  { x: 330, label: '180°' },
  { x: 510, label: '150°W' },
  { x: 690, label: '120°W' },
  { x: 870, label: '75°W' },
] as const
const LATITUDE_TICKS = [
  { y: 60, label: '50°N' },
  { y: 240, label: '20°N' },
] as const

interface RouteMapProps {
  className?: string
}

/**
 * 양식화된 항로 지도. 가는 위도·경도 격자 위에 고정 항구 네 곳(점과 이름), 고정 호 두 개(해상·항공)와
 * 호 위의 장식 점을 그린다(붉은 점은 지연 강조). 정적 장식이라 읽어 주지 않고(aria-hidden),
 * 실제 건수는 옆의 범례(HeroRouteContent)가 글자로 말한다
 */
export function RouteMap({ className }: RouteMapProps) {
  const id = useId()
  const gridId = `${id}-grid`

  return (
    <svg
      viewBox={`0 0 ${ROUTE_MAP_WIDTH} ${ROUTE_MAP_HEIGHT}`}
      preserveAspectRatio="xMaxYMax meet"
      className={cn('overflow-visible text-caption', className)}
      aria-hidden="true"
    >
      {/* 위도·경도 격자: 60단위 타일(왼쪽·위 변에 선)을 그림 좌표 원점에 맞춰 깔아, 그림 왼쪽 밖까지 같은 간격으로 이어진다 */}
      <defs>
        <pattern id={gridId} patternUnits="userSpaceOnUse" width={GRID_STEP} height={GRID_STEP}>
          <path
            d={`M 0 ${GRID_STEP} V 0 H ${GRID_STEP}`}
            fill="none"
            className="stroke-primary-900/8"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect
        x={-GRID_EXTENT}
        y="0"
        width={GRID_EXTENT + ROUTE_MAP_WIDTH}
        height={ROUTE_MAP_HEIGHT}
        fill={`url(#${gridId})`}
      />
      {/* 좌표 눈금(장식용 고정 라벨) */}
      <g className="fill-muted-foreground">
        {LONGITUDE_TICKS.map(({ x, label }) => (
          <text key={label} x={x} y={ROUTE_MAP_HEIGHT - 10} textAnchor="middle">
            {label}
          </text>
        ))}
        {LATITUDE_TICKS.map(({ y, label }) => (
          <text key={label} x={ROUTE_MAP_WIDTH - 8} y={y - 6} textAnchor="end">
            {label}
          </text>
        ))}
      </g>

      {MAP_ARCS.map((arc) => {
        const stroke = ARC_CLASS[arc.transportMode] ?? UNKNOWN_ARC_CLASS
        const dot = DOT_CLASS[arc.transportMode] ?? UNKNOWN_DOT_CLASS

        return (
          <g key={arc.transportMode}>
            {/* 점선 항로 */}
            <path
              d={arc.path}
              fill="none"
              className={stroke}
              strokeWidth="1.5"
              strokeDasharray="3 6"
              strokeLinecap="round"
            />
            {/* 항로를 따라 출발 항구에서 천천히 흐르는 빛 한 점. 항공이 해상보다 빠르다. '동작 줄이기'를 켜면 보이지 않는다 */}
            <circle r="3" className={cn(dot, 'opacity-50 motion-reduce:hidden')}>
              <animateMotion
                dur={`${arc.sparkDurationSeconds}s`}
                repeatCount="indefinite"
                path={arc.path}
              />
            </circle>

            {/* 호 위의 장식 점. 붉은 점은 지연 강조(개수·위치는 고정) */}
            {arc.marks.map((mark) =>
              mark.delayed ? (
                <g key={`${mark.at.x}`}>
                  <circle cx={mark.at.x} cy={mark.at.y} r="12" className="fill-danger/15" />
                  <circle
                    cx={mark.at.x}
                    cy={mark.at.y}
                    r="6"
                    className="fill-danger stroke-card"
                    strokeWidth="2"
                  />
                </g>
              ) : (
                <circle
                  key={`${mark.at.x}`}
                  cx={mark.at.x}
                  cy={mark.at.y}
                  r="5"
                  className={cn(dot, 'stroke-card')}
                  strokeWidth="2"
                />
              ),
            )}
          </g>
        )
      })}

      {/* 항구: 점과 이름 */}
      {MAP_PORTS.map((port) => (
        <g key={port.name}>
          <circle cx={port.at.x} cy={port.at.y} r="4" className="fill-foreground" />
          <text
            x={port.isOrigin ? port.at.x + 5 : port.at.x}
            y={port.at.y + 18}
            textAnchor={port.isOrigin ? 'end' : 'middle'}
            className="fill-muted-foreground font-semibold"
          >
            {port.name}
          </text>
        </g>
      ))}
    </svg>
  )
}
