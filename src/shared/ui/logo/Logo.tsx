import type { ComponentProps } from 'react'

import logoUrl from './glowship-logo.svg'

export function Logo(props: Omit<ComponentProps<'img'>, 'src' | 'alt'>) {
  return <img src={logoUrl} alt="GlowShip" {...props} />
}
