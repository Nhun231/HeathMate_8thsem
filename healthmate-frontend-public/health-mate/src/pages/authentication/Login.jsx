import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Box,
  Alert,
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';
import { login } from '../../services/authService/LoginService.js';
import CustomAlert from '../../components/common/Alert.jsx';
import {
  extractBackendErrorCode,
  translateErrorCode,
} from '../../utils/errorTranslations.js';
import axios from '../../api/axios.js';

const LoginForm = () => {
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    severity: 'info', // 'success', 'error', 'warning', 'info'
  });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const checkEmpty = (formData) => {
    return Object.values(formData).some(
      (value) => !value || value.trim() === ''
    );
  };
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checkEmpty(formData)) {
      setAlert({
        show: true,
        message: 'Vui lòng điền đầy đủ tất cả các trường!',
        severity: 'warning',
      });
      return;
    }
    try {
      const res = await login(formData);
      localStorage.setItem('accessToken', res.data.accessToken);
      setAlert({
        show: true,
        message: 'Đăng nhập thành công, chào mừng tới với HealthMate!',
        severity: 'success',
      });
      navigate('/customer');

      setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 3000);
    } catch (error) {
      const code = extractBackendErrorCode(error) || error?.message;
      const vi =
        translateErrorCode(code) ||
        'Đăng nhập thất bại. Vui lòng kiểm tra email/mật khẩu.';
      setAlert({ show: true, message: vi, severity: 'error' });
      setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 3000);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await axios.get('auth/google');
      // Redirect to Google auth page
      window.location.href = response.data.url;
    } catch {
      setError('Failed to initiate Google login');
    }
  };
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        backgroundImage: "url('https://img.herohealth.com/blog/veggies.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        p: 2,
      }}
    >
      {alert.show && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: 500,
            zIndex: 9999,
          }}
        >
          <CustomAlert
            message={alert.message}
            variant={alert.severity}
            onClose={() => setAlert({ ...alert, show: false })}
          />
        </Box>
      )}
      <Card
        sx={{
          maxWidth: 480,
          width: '100%',
          boxShadow:
            '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header Section */}
          <Box textAlign='center' mb={4}>
            <Typography
              variant='h5'
              component='h1'
              sx={{
                fontWeight: 600,
                color: '#1f2937',
                mb: 0.5,
              }}
            >
              Đăng nhập
            </Typography>
            <Typography
              variant='body1'
              sx={{
                color: '#6b7280',
                mb: 2,
              }}
            >
              HealthMate đồng hành cùng bạn trên hành trình cải thiện vóc dáng
            </Typography>
          </Box>
          <Typography variant='body2' sx={{ color: '#6b7280' }}>
            Chưa có tài khoản?{' '}
            <Typography
              component='a'
              href='/register'
              sx={{
                color: '#22c55e',
                fontWeight: 500,
                textDecoration: 'underline',
                '&:hover': { color: '#16a34a' },
              }}
            >
              Đăng ký ngay
            </Typography>
          </Typography>
          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Email Address */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Email sx={{ mr: 1, color: '#6b7280', fontSize: 20 }} />
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 500, color: '#374151' }}
                  >
                    Email
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name='email'
                  type='email'
                  placeholder='Địa chỉ email'
                  value={formData.email}
                  onChange={handleChange}
                  variant='outlined'
                  size='small'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9fafb',
                      '& fieldset': {
                        borderColor: '#e5e7eb',
                      },
                      '&:hover fieldset': {
                        borderColor: '#d1d5db',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#22c55e',
                      },
                    },
                  }}
                />
              </Box>

              {/* Password */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Lock sx={{ mr: 1, color: '#6b7280', fontSize: 20 }} />
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 500, color: '#374151' }}
                  >
                    Mật khẩu
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Nhập mật khẩu mạnh '
                  value={formData.password}
                  onChange={handleChange}
                  variant='outlined'
                  size='small'
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge='end'
                          sx={{ color: '#6b7280' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9fafb',
                      '& fieldset': {
                        borderColor: '#e5e7eb',
                      },
                      '&:hover fieldset': {
                        borderColor: '#d1d5db',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#22c55e',
                      },
                    },
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  component='a'
                  href='/forgot-password'
                  sx={{
                    color: '#22c55e',
                    fontWeight: 500,
                    textDecoration: 'underline',
                    '&:hover': { color: '#16a34a' },
                  }}
                >
                  Quên mật khẩu?
                </Typography>
              </Box>
              {/* Submit Button */}
              <Button
                type='submit'
                fullWidth
                variant='contained'
                sx={{
                  mt: 1.5,
                  py: 1,
                  backgroundColor: '#22c55e',
                  '&:hover': {
                    backgroundColor: '#16a34a',
                  },
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              >
                Đăng nhập
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  variant='body2'
                  sx={{ fontWeight: 500, color: '#374151' }}
                >
                  Hoặc
                </Typography>
              </Box>
              {error && <div className='error'>{error}</div>}
              <Button
                type='submit'
                fullWidth
                variant='contained'
                sx={{
                  py: 1,
                  backgroundColor: '#22c55e',
                  '&:hover': {
                    backgroundColor: '#16a34a',
                  },
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1, // space between icon and text
                }}
                onClick={handleGoogleLogin}
              >
                <GoogleIcon sx={{ color: '#6b7280' }} />{' '}
                {/* Tailwind grey-500 */}
                Tiếp tục với Google
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginForm;
