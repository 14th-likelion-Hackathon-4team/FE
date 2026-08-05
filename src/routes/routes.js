import { lazy } from 'react';

export const lazyRoutes = {
  MainPage: lazy(() => import('../pages/Mainpage/MainPage')),
  LoginPage: lazy(() => import('../pages/LoginPage/LoginPage')),
  SignupPage: lazy(() => import('../pages/SignupPage/SignupPage')),
  RoutinePage: lazy(() => import('../pages/RoutinePage/RoutinePage')),
  ReportPage: lazy(() => import('../pages/ReportPage/ReportPage')),
  MyPage: lazy(() => import('../pages/Mypage/Mypage')),
};
