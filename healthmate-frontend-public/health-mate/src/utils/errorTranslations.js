// Centralized mapping from backend error codes to Vietnamese messages
// Usage: translateErrorCode(extractBackendErrorCode(err))

const ERROR_CODE_TO_VI = {
  'Error.InvalidOTP': 'Mã OTP không hợp lệ.',
  'Error.OTPExpired': 'Mã OTP đã hết hạn.',
  'Error.FailedToSendOTP': 'Gửi mã OTP thất bại. Vui lòng thử lại.',
  'Error.EmailAlreadyExists': 'Email đã được đăng ký.',
  'Error.EmailNotFound': 'Không tìm thấy tài khoản với email này.',
  'Error.InvalidPassword': 'Mật khẩu không chính xác.',
  'Error.RefreshTokenAlreadyUsed': 'Phiên làm mới đã bị sử dụng. Vui lòng đăng nhập lại.',
  'Error.UnauthorizedAccess': 'Không được phép truy cập. Vui lòng đăng nhập lại.',
};

export function translateErrorCode(code) {
  if (!code || typeof code !== 'string') return null;
  return ERROR_CODE_TO_VI[code] ?? null;
}

// Extract error code from various NestJS exception response shapes
export function extractBackendErrorCode(error) {
  // Axios error typically at error.response.data
  const data = error?.response?.data ?? error?.data ?? error;

  // Case 1: { message: [{ message: 'Error.X', path: '...' }], statusCode, error }
  if (Array.isArray(data?.message) && data?.message[0]?.message) {
    return data.message[0].message;
  }

  // Case 2: { message: { message: [ { message: 'Error.X' } ] } }
  if (Array.isArray(data?.message?.message) && data?.message?.message[0]?.message) {
    return data.message.message[0].message;
  }

  // Case 3: direct string code
  if (typeof data?.message === 'string') {
    return data.message;
  }

  return null;
}


