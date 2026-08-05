import { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import HomeLayout from '@/layouts/HomeLayout';
import PublicLayout from '@/layouts/PublicLayout';
import { lazyRoutes } from '@/routes/routes';

const withSuspense = (Component) => (
  <Suspense fallback={<div>로딩 중...</div>}>
    <Component />
  </Suspense>
);

const publicRoutes = [
  {
    element: <PublicLayout />,
    children: [
      { path: '/login', element: withSuspense(lazyRoutes.LoginPage) },
      { path: '/signup', element: withSuspense(lazyRoutes.SignupPage) },
    ],
  },
];

const appRoutes = [
  {
    path: '/',
    element: <HomeLayout />,
    children: [
      { index: true, element: withSuspense(lazyRoutes.MainPage) },
      { path: 'routines', element: withSuspense(lazyRoutes.RoutinePage) },
      { path: 'reports', element: withSuspense(lazyRoutes.ReportPage) },
      { path: 'mypage', element: withSuspense(lazyRoutes.MyPage) },
    ],
  },
];

export const router = createBrowserRouter([...publicRoutes, ...appRoutes]);
