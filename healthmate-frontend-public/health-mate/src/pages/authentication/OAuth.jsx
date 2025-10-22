import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import {useNavigate} from "react-router-dom";

const OAuth = () => {
  const location = useLocation();
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    console.log('accessToken', accessToken);
    console.log('refreshToken', refreshToken);
    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setTimeout(()=> {navigate('/customer-homepage')},3000)

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
