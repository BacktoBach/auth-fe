import { describe, expect, it } from 'vitest'
import {
  getApiFieldErrors,
  getPasswordByteLength,
  validateChangePasswordForm,
  validateEmail,
  validateRegisterForm,
} from '../../src/utils/validation.js'

describe('form validation', () => {
  it('validates practical email addresses', () => {
    expect(validateEmail(' user@example.com ')).toBe(true)
    expect(validateEmail('user @example.com')).toBe(false)
    expect(validateEmail('invalid')).toBe(false)
  })

  it('measures UTF-8 password bytes and rejects values above bcrypt limit', () => {
    const unicodePassword = '🔐'.repeat(19)
    expect(getPasswordByteLength(unicodePassword)).toBe(76)
    expect(validateRegisterForm({
      name: 'User Name',
      email: 'user@example.com',
      password: unicodePassword,
      confirmPassword: unicodePassword,
    }).password).toContain('72 byte')
  })

  it('validates confirmation and password reuse', () => {
    expect(validateChangePasswordForm({
      oldPassword: 'Password123',
      newPassword: 'Password123',
      confirmPassword: 'different',
    })).toMatchObject({
      newPassword: expect.stringContaining('khác'),
      confirmPassword: expect.stringContaining('không khớp'),
    })
  })

  it('maps structured backend errors safely', () => {
    expect(getApiFieldErrors({
      details: { errors: [{ field: 'email', message: 'Email đã được sử dụng' }] },
    })).toEqual({ email: 'Email đã được sử dụng' })
    expect(getApiFieldErrors(null)).toEqual({})
  })
})
