import { createBrowserRouter, Navigate } from 'react-router'

import { AppLayout } from '@/app/layouts/AppLayout'
import { ADMIN_NAV_ITEMS, NAV_ITEMS } from '@/app/layouts/nav-items'
import { LoginPage } from '@/pages/login'
import { ROUTES } from '@/shared/config'

import { RequireAuth } from './RequireAuth'
import { RequireGuest } from './RequireGuest'
import { RequireRole } from './RequireRole'
import { RouteFallback } from './RouteFallback'

export const router = createBrowserRouter([
  {
    element: <RequireGuest />,
    children: [{ path: ROUTES.LOGIN, element: <LoginPage /> }],
  },
  {
    element: <RequireAuth />,
    children: [
      // 고객사 계정(팀원·팀장)의 화면. 내부 계정(오너·관리자)은 관리 화면으로 보낸다
      {
        element: <RequireRole area="client" />,
        children: [
          {
            element: <AppLayout navItems={NAV_ITEMS} homePath={ROUTES.DASHBOARD} />,
            HydrateFallback: RouteFallback,
            children: [
              { index: true, element: <Navigate to={ROUTES.DASHBOARD} replace /> },
              {
                path: ROUTES.DASHBOARD,
                lazy: async () => ({
                  Component: (await import('@/pages/dashboard')).DashboardPage,
                }),
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
                lazy: async () => ({
                  Component: (await import('@/pages/sync-data')).SyncDataPage,
                }),
              },
            ],
          },
        ],
      },
      // 내부 계정(오너·관리자)의 관리 화면. 고객사 계정은 대시보드로 보낸다
      {
        element: <RequireRole area="internal" />,
        children: [
          {
            element: (
              <AppLayout
                navItems={ADMIN_NAV_ITEMS}
                homePath={ROUTES.ADMIN_HOME}
                showNotification={false}
              />
            ),
            HydrateFallback: RouteFallback,
            children: [
              {
                path: ROUTES.ADMIN_HOME,
                element: <Navigate to={ROUTES.ADMIN_USERS} replace />,
              },
              {
                path: ROUTES.ADMIN_USERS,
                lazy: async () => ({
                  Component: (await import('@/pages/admin-users')).ClientUsersPage,
                }),
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.LOGIN} replace /> },
])
