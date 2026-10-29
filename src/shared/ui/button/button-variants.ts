import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-8pxr rounded-control font-bold whitespace-nowrap',
    'cursor-pointer transition-colors outline-none aria-busy:cursor-progress',
    'focus-visible:ring-[3px] focus-visible:ring-primary/30',
    'disabled:pointer-events-none disabled:bg-disabled disabled:text-disabled-foreground disabled:border-transparent',
    '[&_svg]:size-16pxr [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-700 active:bg-primary-800',
        secondary:
          'border border-input bg-card text-primary hover:bg-primary-100 active:bg-primary-200',
        danger: 'bg-danger text-primary-foreground hover:bg-danger-hover active:bg-danger-pressed',
        link: 'text-primary hover:underline',
        ghost: 'text-foreground hover:bg-muted active:bg-primary-100',
      },
      size: {
        sm: 'h-32pxr px-12pxr text-b2',
        md: 'h-40pxr px-16pxr text-b1',
        lg: 'h-48pxr px-24pxr text-b1',
        icon: 'size-40pxr',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)
