import { createBrowserRouter, Navigate } from 'react-router'

import { AppLayout } from '@/app/layouts/AppLayout'
import { DashboardPage } from '@/pages/dashboard'
import { DecisionHistoryPage } from '@/pages/decision-history'
import { DelayCenterPage } from '@/pages/delay-center'
import { LoginPage } from '@/pages/login'
import { SyncDataPage } from '@/pages/sync-data'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/delay-center', element: <DelayCenterPage /> },
      { path: '/decision-history', element: <DecisionHistoryPage /> },
      { path: '/sync-data', element: <SyncDataPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
