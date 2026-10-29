import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'

import { router } from '@/app/routes/router'

import { queryClient } from './query-client'

export function Providers() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
