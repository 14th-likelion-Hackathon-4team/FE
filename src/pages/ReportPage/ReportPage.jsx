import axios from "axios";
import { useEffect, useState } from "react";
import DailyReport from "./components/DailyReport";
import ReportCalendar from "./components/ReportCalendar";
import WeeklyReport from "./components/WeeklyReport";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const toCalendarStatusByDate = (history) =>
  Object.fromEntries(
    history.map((report) => [
      report.date,
      report.completionRate === 100
        ? "completed"
        : report.alternativeMissionCount > 0
          ? "alternative"
          : "incomplete",
    ]),
  );

const routines = [
  { id: 1, name: "루틴명 텍스트", status: "done" },
  { id: 2, name: "루틴명 텍스트", status: "done" },
  {
    id: 3,
    name: "루틴명 텍스트",
    description: "대체 미션 · 대체 행동 텍스트",
    status: "alternative",
  },
  { id: 4, name: "루틴명 텍스트", status: "incomplete" },
];

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

const createDailyReport = (dateId) => ({
  dateLabel: formatKoreanDate(dateId),
  completedCount: 3,
  counts: { plan: 1, alternative: 1, incomplete: 1 },
  progress: { plan: 33.33, alternative: 33.33 },
  routines,
  feedback: "계획과 달랐지만 대체 미션까지 완료했어요 👏",
});

const weeklySummary = {
  completionRate: 71,
  change: "+8%",
  dateRange: "7/27 – 8/2",
  planRate: 54,
  alternativeRate: 17,
};

const weekdayRates = [
  { weekday: "월", rate: 100 },
  { weekday: "화", rate: 16 },
  { weekday: "수", rate: 40 },
  { weekday: "목", rate: 100 },
  { weekday: "금", rate: 16 },
  { weekday: "토", rate: 69 },
  { weekday: "일", rate: 40 },
];

const causeTags = [
  { label: "약속", count: 5, tone: "success" },
  { label: "피로", count: 3, tone: "danger" },
  { label: "시간부족", count: 2, tone: "neutral" },
];

const suggestions = [
  {
    id: 1,
    message:
      "화·목 저녁에는 시간이 부족했어요.\n운동 루틴을 10분 대체 미션으로 바꿔볼까요?",
  },
  {
    id: 2,
    message:
      "주말에는 시작 시간이 자주 늦어졌어요.\n오전 루틴을 점심 전 가벼운 미션으로 바꿔볼까요?",
  },
  {
    id: 3,
    message:
      "피로한 날에는 긴 루틴을 미루는 경향이 있어요.\n5분짜리 최소 루틴을 준비해둘까요?",
  },
];

const ReportPage = () => {
  const [selectedDate, setSelectedDate] = useState("2026-08-01");
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [appliedSuggestionId, setAppliedSuggestionId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [reportHistory, setReportHistory] = useState([]);

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
          },
        );
        console.log("[ReportPage] 리포트 이력 응답:", response.data);

        setReportHistory(
          Array.isArray(response.data?.data) ? response.data.data : [],
        );
      } catch (error) {
        console.error(
          "[ReportPage] 리포트 이력 조회 실패:",
          error.response?.data ?? error.message,
        );
      }
    };

    fetchReportHistory();
  }, [userId]);

  const currentSuggestion = suggestions[suggestionIndex];
  const selectedReport = createDailyReport(selectedDate);
  const calendarStatusByDate = toCalendarStatusByDate(reportHistory);

  const handleNextSuggestion = () => {
    setSuggestionIndex(
      (currentIndex) => (currentIndex + 1) % suggestions.length,
    );
  };

  return (
    <div className="-mx-[3px] w-[calc(100%+6px)] max-w-[402px] self-start pb-10">
      <ReportCalendar
        bestStreak={12}
        currentStreak={4}
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
        statusByDate={calendarStatusByDate}
        todayDate="2026-08-02"
      />
      <DailyReport report={selectedReport} />
      <WeeklyReport
        causeTags={causeTags}
        isApplied={appliedSuggestionId === currentSuggestion.id}
        onApplySuggestion={() => setAppliedSuggestionId(currentSuggestion.id)}
        onNextSuggestion={handleNextSuggestion}
        suggestion={currentSuggestion}
        summary={weeklySummary}
        weekdayRates={weekdayRates}
      />
    </div>
  );
};

export default ReportPage;
