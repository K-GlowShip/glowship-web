import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import type { AssignedCompany } from '@/shared/api'

import { CreateClientUserPage } from './CreateClientUserPage'

const mockCompanies = vi.hoisted(() => ({ current: [] as AssignedCompany[] }))

vi.mock('@/entities/session', () => ({
  useAssignedCompanies: () => mockCompanies.current,
  getRoleLabel: (code: string) => code,
}))

const company = (name: string, canManageClientAccounts = true): AssignedCompany => ({
  companyId: `id-${name}`,
  companyName: name,
  canManageClientAccounts,
})

const renderPage = (companies: AssignedCompany[]) => {
  mockCompanies.current = companies
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <CreateClientUserPage />
    </QueryClientProvider>,
  )
}

// jsdom에는 없어서, 선택 상자가 열릴 때 강조된 항목으로 스크롤하는 호출이 막힌다
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(cleanup)

describe('CreateClientUserPage', () => {
  it('담당 고객사가 없으면 안내를 보여 주고 폼은 없다', () => {
    renderPage([])

    expect(screen.getByRole('alert').textContent).toContain('담당 고객사가 없어')
    expect(screen.queryByRole('button', { name: '계정 만들기' })).toBeNull()
  })

  it('계정 관리 권한이 있는 고객사가 없으면 권한 안내를 보여 준다', () => {
    renderPage([company('A Beauty', false)])

    expect(screen.getByRole('alert').textContent).toContain(
      '계정 관리 권한이 있는 고객사가 없습니다',
    )
  })

  it('고객사가 하나면 선택 상자 없이 그 고객사로 폼을 보여 준다', () => {
    renderPage([company('A Beauty')])

    expect(screen.queryByRole('combobox')).toBeNull()
    expect(screen.getByText('A Beauty')).toBeTruthy()
    expect(screen.getByRole('button', { name: '계정 만들기' })).toBeTruthy()
  })

  it('권한이 없는 고객사는 선택 목록에 넣지 않는다', async () => {
    renderPage([company('A Beauty'), company('B Beauty', false), company('C Beauty')])

    await userEvent.click(screen.getByRole('combobox', { name: '고객사' }))

    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'A Beauty',
      'C Beauty',
    ])
  })

  it('고객사를 바꾸면 폼이 그 고객사로 바뀌고 입력하던 값은 비워진다', async () => {
    renderPage([company('A Beauty'), company('C Beauty')])
    await userEvent.type(screen.getByLabelText('이름'), '홍길동')

    await userEvent.click(screen.getByRole('combobox', { name: '고객사' }))
    await userEvent.click(screen.getByRole('option', { name: 'C Beauty' }))

    expect(screen.getAllByText('C Beauty').length).toBeGreaterThan(0)
    expect((screen.getByLabelText('이름') as HTMLInputElement).value).toBe('')
  })
})
