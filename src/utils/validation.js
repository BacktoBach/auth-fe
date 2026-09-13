const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_PASSWORD_BYTES = 72

export const getPasswordByteLength = (value) => new TextEncoder().encode(value).length

export const validateEmail = (value) => EMAIL_PATTERN.test(value.trim())

const validatePasswordLength = (password, field, label, errors) => {
  if (!password) errors[field] = `${label} là bắt buộc.`
  else if (password.length < 8) errors[field] = `${label} phải có ít nhất 8 ký tự.`
  else if (getPasswordByteLength(password) > MAX_PASSWORD_BYTES) {
    errors[field] = `${label} không được vượt quá ${MAX_PASSWORD_BYTES} byte UTF-8.`
  }
}

export const validateLoginForm = (form) => {
  const errors = {}
  if (!validateEmail(form.email)) errors.email = 'Email không hợp lệ.'
  if (!form.password) errors.password = 'Mật khẩu là bắt buộc.'
  else if (getPasswordByteLength(form.password) > MAX_PASSWORD_BYTES) {
    errors.password = `Mật khẩu không được vượt quá ${MAX_PASSWORD_BYTES} byte UTF-8.`
  }
  return errors
}

export const validateRegisterForm = (form) => {
  const errors = {}
  const name = form.name.trim()
  if (name.length < 2) errors.name = 'Họ tên phải có ít nhất 2 ký tự.'
  else if (name.length > 100) errors.name = 'Họ tên không được quá 100 ký tự.'
  if (!validateEmail(form.email)) errors.email = 'Email không hợp lệ.'
  validatePasswordLength(form.password, 'password', 'Mật khẩu', errors)
  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp.'
  }
  return errors
}

export const validateChangePasswordForm = (form) => {
  const errors = {}
  if (!form.oldPassword) errors.oldPassword = 'Vui lòng nhập mật khẩu hiện tại.'
  else if (getPasswordByteLength(form.oldPassword) > MAX_PASSWORD_BYTES) {
    errors.oldPassword = `Mật khẩu hiện tại không được vượt quá ${MAX_PASSWORD_BYTES} byte UTF-8.`
  }
  validatePasswordLength(form.newPassword, 'newPassword', 'Mật khẩu mới', errors)
  if (form.newPassword && form.newPassword === form.oldPassword) {
    errors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại.'
  }
  if (form.confirmPassword !== form.newPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp.'
  }
  return errors
}

export const getApiFieldErrors = (error) => {
  const fieldErrors = error?.details?.errors
  if (!Array.isArray(fieldErrors)) return {}

  return fieldErrors.reduce((result, item) => {
    if (typeof item?.field === 'string' && typeof item?.message === 'string') {
      result[item.field] = item.message
    }
    return result
  }, {})
}
