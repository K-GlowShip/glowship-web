import { createBrowserRouter, Navigate } from 'react-router'

import { AppLayout } from '@/app/layouts/AppLayout'
import { DashboardPage } from '@/pages/dashboard'
import { DecisionHistoryPage } from '@/pages/decision-history'
import { DelayCenterPage } from '@/pages/delay-center'
import { LoginPage } from '@/pages/login'
import { SyncDataPage } from '@/pages/sync-data'
import { ROUTES } from '@/shared/config'

export const router = createBrowserRouter([
  { path: ROUTES.LOGIN, element: <LoginPage /> },
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.DASHBOARD} replace /> },
      { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
      { path: ROUTES.DELAY_CENTER, element: <DelayCenterPage /> },
      { path: ROUTES.DECISION_HISTORY, element: <DecisionHistoryPage /> },
      { path: ROUTES.SYNC_DATA, element: <SyncDataPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
