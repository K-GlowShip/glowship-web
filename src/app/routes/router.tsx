import { createBrowserRouter, Navigate } from 'react-router'

import { AppLayout } from '@/app/layouts/AppLayout'
import { LoginPage } from '@/pages/login'
import { ROUTES } from '@/shared/config'

import { RequireAuth } from './RequireAuth'
import { RequireGuest } from './RequireGuest'
import { RouteFallback } from './RouteFallback'

export const router = createBrowserRouter([
  {
    element: <RequireGuest />,
    children: [{ path: ROUTES.LOGIN, element: <LoginPage /> }],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        HydrateFallback: RouteFallback,
        children: [
          { index: true, element: <Navigate to={ROUTES.DASHBOARD} replace /> },
          {
            path: ROUTES.DASHBOARD,
            lazy: async () => ({ Component: (await import('@/pages/dashboard')).DashboardPage }),
          },
          {
            path: ROUTES.DELAY_CENTER,
            lazy: async () => ({
              Component: (await import('@/pages/delay-center')).DelayCenterPage,
            }),
          },
          {
            path: ROUTES.DELAY_CENTER_DETAIL,
            lazy: async () => ({
              Component: (await import('@/pages/delay-center')).DelayDetailPage,
            }),
          },
          {
            path: ROUTES.DECISION_HISTORY,
            lazy: async () => ({
              Component: (await import('@/pages/decision-history')).DecisionHistoryPage,
            }),
          },
          {
            path: ROUTES.SYNC_DATA,
            lazy: async () => ({ Component: (await import('@/pages/sync-data')).SyncDataPage }),
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.LOGIN} replace /> },
])
