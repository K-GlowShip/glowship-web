import { type LatestSyncRun, SYNC_SOURCE_DOMAIN, type SyncSourceDomain } from '@/shared/api'

import {
  getSyncLevel,
  SYNC_LEVEL,
  SYNC_LEVEL_BADGE,
  SYNC_LEVEL_SEVERITY,
  type SyncLevel,
} from './sync-badge'

export const SYNC_SYSTEM = {
  ERP: 'ERP',
  WMS: 'WMS',
  TMS: 'TMS',
} as const

export type SyncSystem = (typeof SYNC_SYSTEM)[keyof typeof SYNC_SYSTEM]

interface SyncCardSpec {
  system: SyncSystem
  /** 화면에 보이는 이름 */
  name: string
  /** 이 카드로 묶는 원천. 앞쪽이 대표 원천이다 */
  domains: readonly SyncSourceDomain[]
}

/** 원천 시스템 단위 카드 (명세 v6.2 4.3절, C39). 서버는 원천 유형별로 내려주고 묶는 계산은 화면이 한다. */
export const SYNC_CARDS: readonly SyncCardSpec[] = [
  {
    system: SYNC_SYSTEM.ERP,
    name: '주문 데이터',
    domains: [SYNC_SOURCE_DOMAIN.ORDER, SYNC_SOURCE_DOMAIN.PRODUCT],
  },
  {
    system: SYNC_SYSTEM.WMS,
    name: '재고 데이터',
    domains: [SYNC_SOURCE_DOMAIN.INVENTORY, SYNC_SOURCE_DOMAIN.WAREHOUSE],
  },
  {
    system: SYNC_SYSTEM.TMS,
    name: '선적 데이터',
    domains: [SYNC_SOURCE_DOMAIN.SHIPMENT],
  },
]

export const SYNC_SOURCE_LABEL: Record<SyncSourceDomain, string> = {
  [SYNC_SOURCE_DOMAIN.ORDER]: '주문',
  [SYNC_SOURCE_DOMAIN.PRODUCT]: '상품',
  [SYNC_SOURCE_DOMAIN.INVENTORY]: '재고',
  [SYNC_SOURCE_DOMAIN.WAREHOUSE]: '창고',
  [SYNC_SOURCE_DOMAIN.SHIPMENT]: '선적',
}

/** 오류·미연동·일부 오류인 원천. 수집 중과 정상은 어느 원천이 문제인지 알릴 필요가 없다 */
const PROBLEM_LEVELS: readonly SyncLevel[] = [
  SYNC_LEVEL.ERROR,
  SYNC_LEVEL.NOT_CONNECTED,
  SYNC_LEVEL.PARTIAL,
]

/** 카드에 묶인 원천 하나의 상태. 카드를 펼쳤을 때 보여 준다 */
export interface SyncSourceSummary {
  domain: SyncSourceDomain
  level: SyncLevel
  badge: (typeof SYNC_LEVEL_BADGE)[SyncLevel]
  openIssueCount: number
}

export interface SyncCardSummary {
  system: SyncSystem
  name: string
  /** 원천 시스템 이름(SAP ERP 등). 묶인 원천 중 처음 내려온 값 */
  sourceSystemName: string | null
  level: SyncLevel
  badge: (typeof SYNC_LEVEL_BADGE)[SyncLevel]
  /** 묶인 원천 중 오래된 마지막 수집 시각. 한쪽이라도 없으면 null */
  lastSyncedAt: string | null
  /** 묶인 원천이 모두 동기화됐을 때만 true */
  isSynced: boolean
  /** 묶인 원천의 미해결 오류 수 합 */
  openIssueCount: number
  /** 문제가 있는 원천 */
  problemDomains: readonly SyncSourceDomain[]
  /** 묶인 원천별 상태. 앞쪽이 대표 원천이다 */
  sources: readonly SyncSourceSummary[]
}

/** 시각 목록 중 가장 오래된 값. 하나라도 비어 있거나 목록이 비면 null */
export const getOldestSyncedAt = (times: readonly (string | null)[]): string | null => {
  let oldest: string | null = null
  for (const time of times) {
    if (time === null) {
      return null
    }
    if (oldest === null || Date.parse(time) < Date.parse(oldest)) {
      oldest = time
    }
  }
  return oldest
}

/**
 * 카드 하나의 상태를 묶인 원천에서 계산한다.
 * 서버가 내려주지 않은 원천은 수집 기록이 없는 것으로 보고 "미연동"으로 센다(정상으로 가리지 않는다).
 */
export const summarizeSyncCard = (
  { system, name, domains }: SyncCardSpec,
  items: readonly LatestSyncRun[],
): SyncCardSummary => {
  const sources = domains.map((domain) => ({
    domain,
    run: items.find((item) => item.sourceDomain === domain),
  }))
  const levelOf = ({ run }: (typeof sources)[number]) =>
    run ? getSyncLevel(run) : SYNC_LEVEL.NOT_CONNECTED
  const level = sources
    .map(levelOf)
    .reduce((worst, next) =>
      SYNC_LEVEL_SEVERITY[next] > SYNC_LEVEL_SEVERITY[worst] ? next : worst,
    )

  return {
    system,
    name,
    sourceSystemName: sources.find(({ run }) => run)?.run?.sourceSystemName ?? null,
    level,
    badge: SYNC_LEVEL_BADGE[level],
    lastSyncedAt: getOldestSyncedAt(sources.map(({ run }) => run?.lastSyncedAt ?? null)),
    isSynced: sources.every(({ run }) => run?.isSynced === true),
    openIssueCount: sources.reduce((sum, { run }) => sum + (run?.openIssueCount ?? 0), 0),
    problemDomains: sources
      .filter((source) => PROBLEM_LEVELS.includes(levelOf(source)))
      .map(({ domain }) => domain),
    sources: sources.map((source) => ({
      domain: source.domain,
      level: levelOf(source),
      badge: SYNC_LEVEL_BADGE[levelOf(source)],
      openIssueCount: source.run?.openIssueCount ?? 0,
    })),
  }
}

export interface SyncOverview {
  cards: readonly SyncCardSummary[]
  /** 모든 카드 중 오래된 마지막 수집 시각 */
  lastSyncedAt: string | null
  /** 어느 원천이든 수집 중이면 true */
  isRunning: boolean
  /** 자동 수집 주기(분). 내려온 값이 없으면 null */
  syncIntervalMinutes: number | null
}

/** 서버가 내려준 원천별 목록으로 카드 3장과 화면 전체 값을 계산한다. */
export const getSyncOverview = (items: readonly LatestSyncRun[]): SyncOverview => {
  const cards = SYNC_CARDS.map((card) => summarizeSyncCard(card, items))

  return {
    cards,
    lastSyncedAt: getOldestSyncedAt(cards.map((card) => card.lastSyncedAt)),
    isRunning: cards.some((card) => card.level === SYNC_LEVEL.RUNNING),
    syncIntervalMinutes: items[0]?.syncIntervalMinutes ?? null,
  }
}
