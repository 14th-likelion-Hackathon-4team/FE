import axios from "axios";
import { useEffect, useState } from "react";
import DailyReport from "./components/DailyReport";
import ReportCalendar from "./components/ReportCalendar";
import WeeklyReport from "./components/WeeklyReport";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

const toWeekdayIndex = (dateId) => {
  const [year, month, day] = dateId.split("-").map(Number);
  return (new Date(year, month - 1, day).getDay() + 6) % 7;
};

const toCalendarStatusByDate = (history) =>
  Object.fromEntries(
    history.map((report) => {
      const totalCount = report.totalRoutineCount;
      const completedCount = report.completedRoutineCount;
      const hasCounts =
        typeof totalCount === "number" && typeof completedCount === "number";
      const isCompleted = hasCounts
        ? totalCount > 0 && completedCount >= totalCount
        : report.completionRate >= 100;

      return [
        report.date,
        report.alternativeMissionCount > 0
          ? "alternative"
          : isCompleted
            ? "completed"
            : "incomplete",
      ];
    }),
  );

const toDateId = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const TODAY_DATE = toDateId(new Date());

const formatKoreanDate = (dateId) => {
  const [year, month, day] = dateId.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ][date.getDay()];

  return `${month}월 ${day}일 ${weekday}`;
};

const createDailyReport = (report, dateId) => {
  const totalCount = report?.totalRoutineCount ?? 0;
  const completedCount = report?.completedRoutineCount ?? 0;
  const alternativeCount = report?.alternativeMissionCount ?? 0;
  const planCount = Math.max(completedCount - alternativeCount, 0);
  const incompleteCount = Math.max(totalCount - completedCount, 0);

  return {
    dateLabel: formatKoreanDate(report?.date ?? dateId),
    completedCount,
    counts: {
      plan: planCount,
      alternative: alternativeCount,
      incomplete: incompleteCount,
    },
    progress: {
      plan: totalCount > 0 ? (planCount / totalCount) * 100 : 0,
      alternative: totalCount > 0 ? (alternativeCount / totalCount) * 100 : 0,
    },
    routines: Array.isArray(report?.routines)
      ? report.routines.map((routine) => ({
          id: routine.routineId,
          name: routine.title,
          status: routine.completed ? "done" : "incomplete",
        }))
      : [],
    feedback:
      totalCount === 0
        ? "등록된 루틴이 없어요."
        : planCount + alternativeCount === totalCount
          ? "오늘 루틴을 모두 완료했어요 👏"
          : alternativeCount > 0
            ? "계획과 달랐지만 대체 미션까지 완료했어요 👏"
            : `오늘 ${planCount}개의 루틴을 완료했어요.`,
  };
};

const formatShortDate = (dateId) => {
  if (!dateId) return "";
  const [, month, day] = dateId.split("-").map(Number);
  return `${month}/${day}`;
};

const ReportPage = () => {
  const [selectedDate, setSelectedDate] = useState(TODAY_DATE);
  const [userId, setUserId] = useState(null);
  const [reportHistory, setReportHistory] = useState([]);
  const [streak, setStreak] = useState({ currentStreak: 0, maxStreak: 0 });
  const [dailyReport, setDailyReport] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCurrentUser = async () => {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        console.error(
          "[ReportPage] 로그인 정보가 없어 /users/me 요청을 중단합니다.",
        );
        return;
      }

      try {
        const response = await axios.get(
          `${BASE_URL}/api/v1/routinefit/users/me`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            signal: controller.signal,
          },
        );
        const currentUserId = response.data?.data?.id;

        if (typeof currentUserId !== "number") {
          console.error(
            "[ReportPage] /users/me 응답에서 userId를 찾지 못했습니다.",
          );
          return;
        }

        setUserId(currentUserId);
      } catch (error) {
        if (axios.isCancel(error)) return;

        console.error(
          "[ReportPage] /users/me 조회 실패:",
          error.response?.data ?? error.message,
        );
      }
    };

    fetchCurrentUser();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (userId === null) return;

    const controller = new AbortController();

    const fetchReportHistory = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      try {
        const response = await axios.get(
          `${BASE_URL}/api/v1/routinefit/reports/history`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: { userId },
            signal: controller.signal,
          },
        );

        setReportHistory(
          Array.isArray(response.data?.data) ? response.data.data : [],
        );
      } catch (error) {
        if (axios.isCancel(error)) return;

        console.error(
          "[ReportPage] 리포트 이력 조회 실패:",
          error.response?.data ?? error.message,
        );
      }
    };

    fetchReportHistory();

    return () => controller.abort();
  }, [userId]);

  useEffect(() => {
    if (userId === null) return;

    const controller = new AbortController();

    const fetchStreak = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      try {
        const response = await axios.get(
          `${BASE_URL}/api/v1/routinefit/reports/streak`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: { userId },
            signal: controller.signal,
          },
        );
        const streakData = response.data?.data;

        setStreak({
          currentStreak: streakData?.currentStreak ?? 0,
          maxStreak: streakData?.maxStreak ?? 0,
        });
      } catch (error) {
        if (axios.isCancel(error)) return;

        console.error(
          "[ReportPage] 연속 기록 조회 실패:",
          error.response?.data ?? error.message,
        );
      }
    };

    fetchStreak();

    return () => controller.abort();
  }, [userId]);

  useEffect(() => {
    if (userId === null) return;

    const controller = new AbortController();

    setDailyReport(null);

    const fetchDailyReport = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      try {
        const response = await axios.get(
          `${BASE_URL}/api/v1/routinefit/reports/daily`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: { userId, date: selectedDate },
            signal: controller.signal,
          },
        );

        setDailyReport(response.data?.data ?? null);
      } catch (error) {
        if (axios.isCancel(error)) return;

        setDailyReport(null);
        console.error(
          "[ReportPage] 일간 리포트 조회 실패:",
          error.response?.data ?? error.message,
        );
      }
    };

    fetchDailyReport();

    return () => controller.abort();
  }, [selectedDate, userId]);

  useEffect(() => {
    if (userId === null) return;

    const controller = new AbortController();

    setWeeklyReport(null);

    const fetchWeeklyReport = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      try {
        const response = await axios.get(
          `${BASE_URL}/api/v1/routinefit/reports/weekly`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: { userId, date: selectedDate },
            signal: controller.signal,
          },
        );

        setWeeklyReport(response.data?.data ?? null);
      } catch (error) {
        if (axios.isCancel(error)) return;

        setWeeklyReport(null);
        console.error(
          "[ReportPage] 주간 리포트 조회 실패:",
          error.response?.data ?? error.message,
        );
      }
    };

    fetchWeeklyReport();

    return () => controller.abort();
  }, [selectedDate, userId]);

  const selectedReport = createDailyReport(dailyReport, selectedDate);
  const calendarStatusByDate = toCalendarStatusByDate(reportHistory);
  const weeklyTotalCount = weeklyReport?.totalRoutineCount ?? 0;
  const weeklyCompletedCount = weeklyReport?.completedRoutineCount ?? 0;
  const weeklyAlternativeCount = reportHistory
    .filter(
      (report) =>
        weeklyReport?.startDate &&
        weeklyReport?.endDate &&
        report.date >= weeklyReport.startDate &&
        report.date <= weeklyReport.endDate,
    )
    .reduce((sum, report) => sum + report.alternativeMissionCount, 0);
  const weeklyPlanCount = Math.max(
    weeklyCompletedCount - weeklyAlternativeCount,
    0,
  );
  const weeklySummary = {
    completionRate: weeklyReport?.completionRate ?? 0,
    change: "—",
    dateRange: weeklyReport
      ? `${formatShortDate(weeklyReport.startDate)} – ${formatShortDate(weeklyReport.endDate)}`
      : "",
    planRate:
      weeklyTotalCount > 0
        ? Math.round((weeklyPlanCount / weeklyTotalCount) * 100)
        : 0,
    alternativeRate:
      weeklyTotalCount > 0
        ? Math.round((weeklyAlternativeCount / weeklyTotalCount) * 100)
        : 0,
  };
  const weekdayRates = Array.isArray(weeklyReport?.dailyReports)
    ? [...weeklyReport.dailyReports]
        .sort((a, b) => toWeekdayIndex(a.date) - toWeekdayIndex(b.date))
        .map((report) => ({
          weekday: WEEKDAY_LABELS[toWeekdayIndex(report.date)],
          rate: report.completionRate,
        }))
    : [];

  return (
    <div className="-mx-[3px] w-[calc(100%+6px)] max-w-[402px] self-start pb-10">
      <ReportCalendar
        bestStreak={streak.maxStreak}
        currentStreak={streak.currentStreak}
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
        statusByDate={calendarStatusByDate}
        todayDate={TODAY_DATE}
      />
      <DailyReport report={selectedReport} />
      <WeeklyReport summary={weeklySummary} weekdayRates={weekdayRates} />
    </div>
  );
};

export default ReportPage;
