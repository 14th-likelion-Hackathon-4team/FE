import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import DeleteConfirmDialog from '@/pages/RoutinePage/components/DeleteConfirmDialog';

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

const formatTime = (time) => {
  if (!time) return '없음';

  const [hour, minute] = time.split(':').map(Number);
  const period = hour < 12 ? '오전' : '오후';
  return `${period} ${hour % 12 || 12}:${String(minute).padStart(2, '0')}`;
};

const formatDate = (date) => (date ? date.replaceAll('-', '.') : '없음');

const formatRepeat = (routine) => {
  if (routine.repeatType === 'DAILY') return '매일';
  if (routine.repeatType === 'COUNT') return `주 ${routine.repeatCount}회`;

  return routine.repeatDays
    ?.split(',')
    .map((day) => dayLabels[day])
    .filter(Boolean)
    .join(' · ') || '없음';
};

const formatNotification = (routine) => {
  if (!routine.alarm) return 'OFF';
  if (!routine.alarmTime) return 'ON';
  if (!routine.performTime) return `ON · ${formatTime(routine.alarmTime)}`;

  const [performHour, performMinute] = routine.performTime.split(':').map(Number);
  const [alarmHour, alarmMinute] = routine.alarmTime.split(':').map(Number);
  const performMinutes = performHour * 60 + performMinute;
  const alarmMinutes = alarmHour * 60 + alarmMinute;
  const minutesBefore = (performMinutes - alarmMinutes + 24 * 60) % (24 * 60);

  if (minutesBefore === 0) return 'ON · 정시';
  if (minutesBefore === 10 || minutesBefore === 30) return `ON · ${minutesBefore}분 전`;
  return `ON · ${formatTime(routine.alarmTime)}`;
};

const toLocalDateString = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return localDate.toISOString().slice(0, 10);
};

const buildRecentDays = (recentHistory = []) => {
  const historyByDate = new Map(recentHistory.map((history) => [history.logDate, history]));

  return Array.from({ length: 28 }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (27 - index));
    const dateKey = toLocalDateString(date);

    return {
      date: dateKey,
      history: historyByDate.get(dateKey) ?? null,
    };
  });
};

const getHistoryStyle = (status) => {
  if (status === 'DONE') return 'border-primary-soft bg-success';
  if (status === 'MISSED') return 'border-danger bg-danger';
  return 'border-primary-soft bg-surface';
};

const getStatusErrorMessage = (error) => {
  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;

  if (status === 401) return '로그인이 만료되었습니다. 다시 로그인해주세요.';
  if (status === 403) return '이 루틴의 상태를 변경할 권한이 없습니다.';
  if (status === 404) return '존재하지 않거나 삭제된 루틴입니다.';
  return serverMessage || '루틴 상태를 변경하지 못했습니다.';
};

const getDeleteErrorMessage = (error) => {
  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;

  if (status === 401) return '로그인이 만료되었습니다. 다시 로그인해주세요.';
  if (status === 403) return '이 루틴을 삭제할 권한이 없습니다.';
  if (status === 404) return '존재하지 않거나 이미 삭제된 루틴입니다.';
  return serverMessage || '루틴을 삭제하지 못했습니다.';
};

const RoutineDetailPage = () => {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
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
        const response = await axios.get(`${BASE_URL}/api/v1/routinefit/routines/${routineId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });
        setRoutine(response.data.data);
      } catch (error) {
        if (axios.isCancel(error)) return;

        const status = error.response?.status;
        if (status === 401) {
          setFetchError('로그인이 만료되었습니다. 다시 로그인해주세요.');
        } else if (status === 403) {
          setFetchError('이 루틴을 조회할 권한이 없습니다.');
        } else {
          setFetchError(error.response?.data?.message || '루틴 상세 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchRoutine();

    return () => controller.abort();
  }, [routineId]);

  const recentDays = useMemo(
    () => buildRecentDays(routine?.recentHistory),
    [routine?.recentHistory],
  );

  const handleClose = () => navigate('/routines');
  const handleEdit = () => navigate(`/routines/${routineId}/edit`);

  const handleToggleRoutine = async (active) => {
    if (!routine) return;

    const nextActive = typeof active === 'boolean' ? active : !routine.active;
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      window.alert('로그인 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }

    try {
      const response = await axios.patch(
        `${BASE_URL}/api/v1/routinefit/routines/${routineId}/status`,
        { active: nextActive },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const updatedActive = response.data?.data?.active;

      setRoutine((current) => (
        current
          ? {
            ...current,
            active: typeof updatedActive === 'boolean' ? updatedActive : nextActive,
          }
          : current
      ));
    } catch (error) {
      window.alert(getStatusErrorMessage(error));
    }
  };

  const handleConfirmDelete = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      window.alert('로그인 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }

    try {
      await axios.delete(
        `${BASE_URL}/api/v1/routinefit/routines/${routineId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      setDeleteOpen(false);
      navigate('/routines', { replace: true });
    } catch (error) {
      window.alert(getDeleteErrorMessage(error));
    }
  };

  const handlePauseInstead = () => {
    handleToggleRoutine(false);
    setDeleteOpen(false);
  };

  if (isLoading || fetchError || !routine) {
    return (
      <section className="flex min-h-[816px] w-[402px] min-w-[402px] max-w-[402px] shrink-0 flex-col self-start bg-background pb-10">
        <header className="grid h-[43px] shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-text-main px-[17px]">
          <button aria-label="루틴 목록으로 닫기" className="justify-self-start text-[24px] font-bold leading-none text-text-main" onClick={handleClose} type="button">×</button>
          <h1 className="text-[18px] font-bold text-text-main">루틴 상세</h1>
          <span aria-hidden="true" />
        </header>
        <p className="m-auto px-6 text-center text-[14px] text-text-muted">
          {isLoading ? '루틴 정보를 불러오는 중입니다...' : fetchError}
        </p>
      </section>
    );
  }

  const infoRows = [
    ['반복 주기', formatRepeat(routine)],
    ['수행 시간', formatTime(routine.performTime)],
    ['기간', `${formatDate(routine.startDate)} ~ ${formatDate(routine.endDate)}`],
    ['알림', formatNotification(routine)],
  ];
  const dialogRoutine = { ...routine, name: routine.title };

  return (
    <>
      <section aria-label="루틴 상세" className="flex min-h-[816px] w-[402px] min-w-[402px] max-w-[402px] shrink-0 flex-col self-start bg-background pb-10">
        <header className="grid h-[43px] shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-text-main px-[17px]">
          <button aria-label="루틴 목록으로 닫기" className="justify-self-start text-[24px] font-bold leading-none text-text-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={handleClose} type="button">×</button>
          <h1 className="text-[18px] font-bold text-text-main">루틴 상세</h1>
          <span aria-hidden="true" />
        </header>

        <div className="px-[17px] pt-[17px]">
          <h2 className="text-[20px] font-bold text-text-main">{routine.title}</h2>

          <div className="mt-2.5 flex items-center gap-2.5">
            <button aria-label="루틴 활성 상태" aria-pressed={routine.active} className="relative h-6 w-[42px] shrink-0 rounded-full border border-primary-soft bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={() => handleToggleRoutine()} type="button">
              <span aria-hidden="true" className={`absolute left-[2px] top-[2px] size-[18px] rounded-full border border-primary-soft transition-transform ${routine.active ? 'translate-x-[19px] bg-primary' : 'translate-x-0 bg-surface'}`} />
            </button>
            <span className="text-[13px] font-medium text-text-main">
              {routine.active ? '활성 상태' : '일시중지 상태'}
            </span>
          </div>

          <dl className="mt-4 rounded-2xl border border-primary-soft bg-surface">
            {infoRows.map(([label, value], index) => (
              <div key={label} className={`flex h-[38px] items-center justify-between px-4 ${index > 0 ? 'border-t border-primary-soft' : ''}`}>
                <dt className="text-[14px] font-medium text-text-main">{label}</dt>
                <dd className="max-w-[250px] truncate text-[14px] font-medium text-text-main">{value}</dd>
              </div>
            ))}
          </dl>

          <h3 className="mt-5 text-[13px] font-medium text-text-main">최근 4주 수행</h3>
          <div aria-label="최근 4주 수행 기록" className="mt-2 grid grid-cols-7 gap-1.5 rounded-xl border border-primary-soft bg-surface p-3" role="img">
            {recentDays.map(({ date, history }) => (
              <span
                key={date}
                aria-label={`${date} ${history?.status === 'DONE' ? '완료' : history?.status === 'MISSED' ? '미수행' : '기록 없음'}`}
                className={`aspect-square rounded-[4px] border ${getHistoryStyle(history?.status)}`}
                title={`${date} · ${history?.status ?? '기록 없음'}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-auto flex gap-3.5 px-[17px] pt-10">
          <button className="h-[54px] w-[90px] shrink-0 rounded-xl border border-primary-soft bg-surface text-[15px] font-semibold text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={() => setDeleteOpen(true)} type="button">삭제</button>
          <button className="h-[54px] flex-1 rounded-xl border border-primary-soft bg-primary text-[16px] font-bold text-text-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={handleEdit} type="button">수정하기</button>
        </div>
      </section>

      <DeleteConfirmDialog
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        onPause={handlePauseInstead}
        routine={deleteOpen ? dialogRoutine : null}
      />
    </>
  );
};

export default RoutineDetailPage;
