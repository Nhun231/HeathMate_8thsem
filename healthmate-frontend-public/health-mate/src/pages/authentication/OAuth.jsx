import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';

const OAuth = () => {
  const location = useLocation();
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      window.location.href = '/customer-homepage';
    } else {
      const errorMessage = searchParams.get('errorMessage');
      setError(
        errorMessage ?? 'Something went wrong with Google authentication'
      );
    }
  }, [location]);

  return <div>{error && <div className='error'>{error}</div>}</div>;
};

export default OAuth;
