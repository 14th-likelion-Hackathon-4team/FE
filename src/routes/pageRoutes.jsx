import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import HomeLayout from '@/layouts/HomeLayout';

// lazy import를 직접 변수로 선언
const MainPage = lazy(() => import('../pages/Mainpage/MainPage'));
const LoginPage = lazy(() => import('../pages/LoginPage/LoginPage'));
const SignupPage = lazy(() => import('../pages/SignupPage/SignupPage'));
const SurveyPage = lazy(() => import('../pages/SurveyPage/SurveyPage'));
const MatchPage = lazy(() => import('../pages/MatchPage/MatchPage'));
const MyPage = lazy(() => import('../pages/Mypage/Mypage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage/ProfilePage'));

// Suspense 래퍼
const withSuspense = (Component) => (
  <Suspense fallback={<div>로딩 중...</div>}>
    <Component />
  </Suspense>
);

const publicRoutes = [
  {
    path: '/',
    element: <HomeLayout />,
    children: [
      { index: true, element: withSuspense(MainPage) },
      { path: 'login', element: withSuspense(LoginPage) },
      { path: 'signup', element: withSuspense(SignupPage) },
      { path: 'survey', element: withSuspense(SurveyPage) },
      { path: 'match', element: withSuspense(MatchPage) },
      { path: 'profile/:userId', element: withSuspense(ProfilePage) },
      { path: 'mypage', element: withSuspense(MyPage) },
    ],
  },
];

const protectedRoutes = [
  {
    // path: '/mypage',
    // element: <ProtectedLayout />,
    // children: [{ index: true, element: <lazyRoutes.MyPage /> }],
  },
];

export const router = createBrowserRouter([...publicRoutes, ...protectedRoutes]);
