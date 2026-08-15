import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import DeleteConfirmDialog from '@/pages/RoutinePage/components/DeleteConfirmDialog';
import RoutineForm from '@/pages/RoutinePage/components/RoutineForm';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const dayLabels = {
  MON: '월',
  TUE: '화',
  WED: '수',
  THU: '목',
  FRI: '금',
  SAT: '토',
  SUN: '일',
};

const dayCodes = Object.fromEntries(
  Object.entries(dayLabels).map(([code, label]) => [label, code]),
);

const repeatTypeCodes = {
  days: 'WEEKLY',
  daily: 'DAILY',
  count: 'COUNT',
};

const toFormTime = (time) => (time ? time.slice(0, 5) : '');

const toTimeWithSeconds = (time) => (time ? `${time}:00` : null);

const getNotificationTiming = (performTime, alarmTime) => {
  if (!performTime || !alarmTime) return '정시';

  const [performHour, performMinute] = performTime.split(':').map(Number);
  const [alarmHour, alarmMinute] = alarmTime.split(':').map(Number);
  const minutesBefore = (
    performHour * 60 + performMinute - (alarmHour * 60 + alarmMinute) + 24 * 60
  ) % (24 * 60);

  if (minutesBefore === 10) return '10분 전';
  if (minutesBefore === 30) return '30분 전';
  return '정시';
};

const calculateAlarmTime = (performTime, notificationTiming) => {
  if (!performTime) return null;

  const minutesBefore = {
    정시: 0,
    '10분 전': 10,
    '30분 전': 30,
  }[notificationTiming];
  const [hour, minute] = performTime.split(':').map(Number);
  const alarmMinutes = (hour * 60 + minute - minutesBefore + 24 * 60) % (24 * 60);

  return `${String(Math.floor(alarmMinutes / 60)).padStart(2, '0')}:${String(alarmMinutes % 60).padStart(2, '0')}:00`;
};

const toFormRoutine = (routine) => ({
  id: routine.id,
  name: routine.title,
  repeatType: routine.repeatType === 'DAILY'
    ? 'daily'
    : routine.repeatType === 'COUNT'
      ? 'count'
      : 'days',
  days: routine.repeatDays
    ?.split(',')
    .map((day) => dayLabels[day])
    .filter(Boolean) ?? [],
  repeatCount: routine.repeatCount ?? 3,
  time: toFormTime(routine.performTime),
  startDate: routine.startDate,
  endDate: routine.endDate ?? '',
  notificationEnabled: routine.alarm,
  notificationTiming: getNotificationTiming(routine.performTime, routine.alarmTime),
  active: routine.active,
});

const getRepeatValues = (routine) => {
  if (routine.repeatType === 'daily') {
    return {
      repeatDays: 'MON,TUE,WED,THU,FRI,SAT,SUN',
      repeatCount: null,
    };
  }

  if (routine.repeatType === 'count') {
    return {
      repeatDays: null,
      repeatCount: Number(routine.repeatCount),
    };
  }

  return {
    repeatDays: routine.days.map((day) => dayCodes[day]).join(','),
    repeatCount: null,
  };
};

const getErrorMessage = (error, action) => {
  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;

  if (status === 400) return serverMessage || '입력한 루틴 정보를 확인해주세요.';
  if (status === 401) return '로그인이 만료되었습니다. 다시 로그인해주세요.';
  if (status === 403) return '이 루틴을 수정할 권한이 없습니다.';
  if (status === 404) return '존재하지 않거나 삭제된 루틴입니다.';
  return serverMessage || `루틴을 ${action}하지 못했습니다.`;
};

const RoutineEditPage = () => {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchRoutine = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setFetchError('로그인 정보가 없습니다. 다시 로그인해주세요.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${BASE_URL}/api/v1/routinefit/routines/${routineId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            signal: controller.signal,
          },
        );
        setRoutine(toFormRoutine(response.data.data));
      } catch (error) {
        if (axios.isCancel(error)) return;
        setFetchError(getErrorMessage(error, '조회'));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchRoutine();

    return () => controller.abort();
  }, [routineId]);

  const handleClose = () => navigate(`/routines/${routineId}`);

  const handleSave = async (draft) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setSubmitError('로그인 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }

    const repeatValues = getRepeatValues(draft);
    const requestBody = {
      title: draft.name.trim(),
      performTime: toTimeWithSeconds(draft.time),
      repeatDays: repeatValues.repeatDays,
      alarm: draft.notificationEnabled,
      active: draft.active,
      startDate: draft.startDate,
      endDate: draft.endDate || null,
      alarmTime: draft.notificationEnabled
        ? calculateAlarmTime(draft.time, draft.notificationTiming)
        : null,
      repeatType: repeatTypeCodes[draft.repeatType],
      repeatCount: repeatValues.repeatCount,
    };

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await axios.patch(
        `${BASE_URL}/api/v1/routinefit/routines/${routineId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      navigate(`/routines/${routineId}`, { replace: true });
    } catch (error) {
      setSubmitError(getErrorMessage(error, '수정'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || fetchError || !routine) {
    return (
      <section className="flex min-h-[792px] w-[402px] min-w-[402px] max-w-[402px] shrink-0 flex-col self-start bg-background pb-10">
        <header className="grid h-[43px] grid-cols-[1fr_auto_1fr] items-center border-b border-text-main px-[17px]">
          <button aria-label="루틴 상세로 돌아가기" className="justify-self-start text-[24px] font-bold leading-none text-text-main" onClick={handleClose} type="button">←</button>
          <h1 className="text-[18px] font-bold text-text-main">루틴 수정</h1>
          <span aria-hidden="true" />
        </header>
        <p className="m-auto px-6 text-center text-[14px] text-text-muted">
          {isLoading ? '루틴 정보를 불러오는 중입니다...' : fetchError}
        </p>
      </section>
    );
  }

  return (
    <>
      <RoutineForm
        initialRoutine={routine}
        isSubmitting={isSubmitting}
        mode="edit"
        onCancel={handleClose}
        onDelete={() => setDeleteOpen(true)}
        onSave={handleSave}
        submitError={submitError}
      />
      <DeleteConfirmDialog
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => navigate('/routines', { replace: true })}
        onPause={() => setDeleteOpen(false)}
        routine={deleteOpen ? routine : null}
      />
    </>
  );
};

export default RoutineEditPage;
