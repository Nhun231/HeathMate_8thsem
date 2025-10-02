import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <AppBar
      position='sticky'
      sx={{
        background: 'linear-gradient(90deg, #4CAF50, #66BB6A)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      <Toolbar sx={{ maxWidth: '1600px', mx: 'auto', width: '100%' }}>
        {/* Logo */}

        <Typography
          variant='h5'
          component='div'
          sx={{
            flexGrow: 1,
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#ffffff',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.05)', opacity: 0.9 },
          }}
        >
          <Link
            to='/customer'
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            HealthMate
          </Link>
        </Typography>

        {/* Nút đăng nhập/đăng ký */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isLoggedIn ? (
            <>
              <Button
                color='inherit'
                onClick={() => navigate('/calculate')}
                sx={{ fontWeight: 'bold' }}
              >
                Công cụ tính toán
              </Button>
              <Button
                color='inherit'
                onClick={() => navigate('/meal')}
                sx={{ fontWeight: 'bold' }}
              >
                Thực đơn hôm nay
              </Button>
              <Button
                color='inherit'
                onClick={() => navigate('/set-goal')}
                sx={{ fontWeight: 'bold' }}
              >
                Lập kế hoạch ăn uống
              </Button>
              <Button
                color='inherit'
                onClick={() => navigate('/my-profile')}
                sx={{ fontWeight: 'bold' }}
              >
                Hồ sơ
              </Button>
              <Button
                color='inherit'
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}
                sx={{ fontWeight: 'bold' }}
              >
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Button
                color='inherit'
                onClick={() => navigate('/login')}
                sx={{ fontWeight: 'bold' }}
              >
                Đăng nhập
              </Button>
              <Button
                variant='contained'
                onClick={() => navigate('/register')}
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #FF8A65, #FF7043)',
                  color: '#fff',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FF7043, #FF8A65)',
                  },
                  boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
                }}
              >
                Đăng ký
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
