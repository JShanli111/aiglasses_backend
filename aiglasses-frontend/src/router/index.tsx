import { createBrowserRouter, Navigate as RouterNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Translate from '@/pages/features/Translate';
import Calorie from '@/pages/features/Calorie';
import NavigatePage from '@/pages/features/Navigate';
import { useAuthStore } from '@/stores/auth';

// 路由守卫组件
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore(state => state.token);
  if (!token) return <RouterNavigate to="/login" replace />;
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <RouterNavigate to="/translate" /> },
      { path: '/translate', element: <PrivateRoute><Translate /></PrivateRoute> },
      { path: '/calorie', element: <PrivateRoute><Calorie /></PrivateRoute> },
      { path: '/navigate', element: <PrivateRoute><NavigatePage /></PrivateRoute> },
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  }
]); 