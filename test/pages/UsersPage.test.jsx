import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import UsersPage from '../../src/pages/UsersPage.jsx'
import { getUsers } from '../../src/services/userService.js'

vi.mock('../../src/services/userService.js', () => ({ getUsers: vi.fn() }))

const emptyPage = {
  users: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
}

describe('UsersPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    getUsers.mockReset().mockResolvedValue(emptyPage)
  })

  it('debounces search and sends it to the backend', async () => {
    render(<UsersPage />)
    await act(() => Promise.resolve())
    expect(getUsers).toHaveBeenCalledWith(expect.objectContaining({ search: '' }))

    fireEvent.change(screen.getByPlaceholderText('Tìm theo tên hoặc email...'), {
      target: { value: 'mentor@example.com' },
    })
    expect(getUsers).toHaveBeenCalledTimes(1)

    await act(() => vi.advanceTimersByTimeAsync(300))
    await act(() => Promise.resolve())
    expect(getUsers).toHaveBeenLastCalledWith(expect.objectContaining({
      page: 1,
      search: 'mentor@example.com',
    }))
    vi.useRealTimers()
  })
})
