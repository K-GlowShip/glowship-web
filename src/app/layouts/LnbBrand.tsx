/** 사이드바 맨 위 로고. 실제 사이드바(링크)와 대기 화면(링크 없음)이 같은 모양을 쓴다 */
export function LnbBrand() {
  return (
    <>
      <img src="/favicon.svg" alt="" className="h-28pxr w-auto" />
      <span className="text-h3 font-bold text-primary">GlowShip</span>
    </>
  )
}
