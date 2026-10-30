import { Logo } from '@/shared/ui/logo'

export function LoginHero() {
  return (
    <section className="hidden flex-col gap-24pxr lg:flex">
      <Logo className="w-104pxr" />
      <p className="text-display font-bold text-foreground">
        물류의 흐름에,
        <br />
        한발 앞선 확신을.
      </p>
      <p className="text-b1 text-muted-foreground">
        주문부터 입고까지 연결하고,
        <br />
        지연의 영향을 더 빠르게 파악하세요.
      </p>
      <LoginHeroDivider />
    </section>
  )
}

function LoginHeroDivider() {
  return (
    <div className="mt-12pxr flex items-center gap-12pxr text-primary" aria-hidden="true">
      <span className="h-2pxr w-130pxr bg-current" />
      <Sparkle className="size-24pxr" />
      <span className="h-2pxr w-40pxr bg-current" />
    </div>
  )
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="53.94 0 41.76 40.6" fill="currentColor" aria-hidden="true">
      <path d="M74.8199 0L80.4594 14.8172L95.6999 20.3L80.4594 25.7828L74.8199 40.6L69.1804 25.7828L53.9399 20.3L69.1804 14.8172L74.8199 0Z" />
    </svg>
  )
}
