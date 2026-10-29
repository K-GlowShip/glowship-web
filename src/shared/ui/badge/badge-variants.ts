import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center gap-6pxr rounded-full px-8pxr py-4pxr text-caption font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        success: 'bg-success-bg text-success',
        warning: 'bg-warning-bg text-warning',
        danger: 'bg-danger-bg text-danger',
        info: 'bg-info-bg text-info',
        neutral: 'bg-disabled text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
)
