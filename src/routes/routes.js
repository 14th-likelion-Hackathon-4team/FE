import { lazy } from 'react';

export const lazyRoutes = {
  MainPage: lazy(() => import('../pages/Mainpage/MainPage')),
  LoginPage: lazy(() => import('../pages/LoginPage/LoginPage')),
  SignupPage: lazy(() => import('../pages/SignupPage/SignupPage')),
  SurveyPage: lazy(() => import('../pages/SurveyPage/SurveyPage')),
  MatchPage: lazy(() => import('../pages/MatchPage/MatchPage')),
  MyPage: lazy(() => import('../pages/Mypage/Mypage')),
  ProfilePage: lazy(() => import('../pages/ProfilePage/ProfilePage')),
};
