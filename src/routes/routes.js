import { lazy } from "react";

export const lazyRoutes = {
  MainPage: lazy(() => import("../pages/Mainpage/MainPage")),
  LoginPage: lazy(() => import("../pages/LoginPage/LoginPage")),
  SignupPage: lazy(() => import("../pages/SignupPage/SignupPage")),
  RoutinePage: lazy(() => import("../pages/RoutinePage/RoutinePage")),
  RoutineCreatePage: lazy(() => import("../pages/RoutineCreatePage/RoutineCreatePage")),
  RoutineDetailPage: lazy(() => import("../pages/RoutineDetailPage/RoutineDetailPage")),
  RoutineEditPage: lazy(() => import("../pages/RoutineEditPage/RoutineEditPage")),
  ReportPage: lazy(() => import("../pages/ReportPage/ReportPage")),
  MyPage: lazy(() => import("../pages/Mypage/Mypage")),
  AiChatPage: lazy(() => import("../pages/AiChatPage/AiChatPage")),
};
