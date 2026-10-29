import { SYNC_SOURCES } from '../model/sync-sources'
import { ProductPanel } from './ProductPanel'
import { SyncSourceCard } from './SyncSourceCard'

export function SyncDataPage() {
  return (
    <div className="flex flex-col gap-24pxr">
      <header>
        <h1 className="text-h1 font-bold">연동 데이터 조회</h1>
        <p className="text-b1 text-muted-foreground">연동한 데이터를 조회해보세요</p>
      </header>

      <section className="grid gap-24pxr md:grid-cols-3" aria-label="데이터 수집 현황">
        {SYNC_SOURCES.map((source) => (
          <SyncSourceCard key={source.id} source={source} />
        ))}
      </section>

      <ProductPanel />
    </div>
  )
}
