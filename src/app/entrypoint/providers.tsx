import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'

import { router } from '@/app/routes/router'
import { TooltipProvider } from '@/shared/ui/tooltip'

import { queryClient } from './query-client'

export function Providers() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
