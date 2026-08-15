import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiBell, FiCheck, FiChevronRight, FiDroplet, FiHeart, FiSmile, FiX } from 'react-icons/fi';
import { LuDumbbell } from 'react-icons/lu';
import { completeRoutine, getMainPage, getMyProfile, getTodayNotifications, readNotification } from '@/api/mainApi';

const formatScheduledTime = (scheduledTime) => {
  if (!scheduledTime) return '--:--';
  const hour = String(scheduledTime.hour ?? 0).padStart(2, '0');
  const minute = String(scheduledTime.minute ?? 0).padStart(2, '0');
  return `${hour}:${minute}`;
};

const getRoutineVisual = (routineName = '') => {
  if (/물|수분/.test(routineName)) return { tone: 'blue', icon: FiDroplet };
  if (/운동|스트레칭/.test(routineName)) return { tone: 'yellow', icon: LuDumbbell };
  if (/스킨|약|케어/.test(routineName)) return { tone: 'red', icon: FiHeart };
  return { tone: 'green', icon: FiSmile };
};

const normalizeRoutine = (routine) => ({
  id: routine.routineId,
  title: routine.routineName,
  time: formatScheduledTime(routine.scheduledTime),
  scheduledMinutes: (routine.scheduledTime?.hour ?? 0) * 60 + (routine.scheduledTime?.minute ?? 0),
  status: routine.completed ? '완료' : '대기',
  completed: Boolean(routine.completed),
  ...getRoutineVisual(routine.routineName),
});
const toneStyles = {
  green: { icon: 'bg-[#d9f2d5] text-[#67bb82]', status: 'bg-[#d9f2d5] text-[#64a56e]' },
  blue: { icon: 'bg-[#dcebff] text-[#7baded]', status: 'bg-[#dceaff] text-[#6994cc]' },
  red: { icon: 'bg-[#f9dfdf] text-[#e78d84]', status: 'bg-[#ececec] text-[#777]' },
  yellow: { icon: 'bg-[#fff5c7] text-[#8b78f2]', status: 'bg-[#ececec] text-[#777]' },
};

const RoutineItem = ({ icon: Icon, id, isExpanded, isHighlighted, isMissed = false, onToggle, status, time, title, tone }) => {
  const styles = toneStyles[tone];
  const isCompleted = status.includes('완료');
  const statusStyle = isMissed || status === '미완료'
    ? 'border border-[#e78d84] bg-[#fff4f2] text-[#c65f55]'
    : status === '대체 미션 완료'
      ? toneStyles.blue.status
      : isCompleted
        ? toneStyles.green.status
        : 'bg-[#ececec] text-[#777]';
  const displayedStatus = isMissed ? '미완료(자정)' : status;
  const statusPadding = displayedStatus === '대체 미션 완료' ? 'px-3' : 'px-5';
  const highlightStyle = isHighlighted
    ? 'border-2 border-[#e78d84] shadow-[0_0_0_3px_rgba(231,141,132,0.08)]'
    : 'border-[#ece9e2]';

  if (isExpanded) {
    return (
      <article className={`rounded-[24px] border-2 bg-[#fffdf2] px-5 shadow-[0_5px_10px_rgba(170,136,36,0.08)] transition-all duration-300 ${isCompleted ? 'py-6' : 'pb-7 pt-8'} ${isHighlighted ? 'border-[#e78d84]' : 'border-[#f2d984]'}`} data-routine-id={id}>
        <button className="grid w-full grid-cols-[48px_minmax(0,1fr)] items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-primary" onClick={onToggle} type="button">
          <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}>
            <Icon aria-hidden="true" className="size-7" strokeWidth={2.4} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[16px] font-semibold tracking-[-0.03em] text-[#777268]">선택한 루틴이에요!</p>
              <span className={`justify-self-end shrink-0 rounded-full py-2 text-[14px] font-semibold leading-none ${statusPadding} ${statusStyle}`}>{displayedStatus}</span>
            </div>
            <h3 className="whitespace-nowrap text-[32px] font-extrabold leading-tight tracking-[-0.05em] text-[#181818]">{title}</h3>
            <p className="mt-1 text-[16px] font-semibold text-[#929292]">{time}</p>
          </div>
        </button>
        {!isCompleted && !isMissed && (
          <div className="mt-7">
            <button className="min-h-[58px] w-full rounded-full border border-[#e6e6e6] bg-white px-3 text-[16px] font-bold text-[#444] shadow-[0_3px_8px_rgba(44,44,44,0.09)] active:scale-[0.98]" type="button">못 지킬 것 같아요</button>
          </div>
        )}
      </article>
    );
  }

  return (
    <button className={`grid min-h-[76px] w-full grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 rounded-[19px] border bg-white px-3 text-left transition-[border-color,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-primary ${highlightStyle}`} data-routine-id={id} onClick={onToggle} type="button">
      <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}>
        <Icon aria-hidden="true" className="size-7" strokeWidth={2.4} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] font-bold leading-tight text-[#292929]">{title}</p>
        <p className="mt-0.5 text-[14px] leading-tight text-[#8d8d8d]">{time}</p>
      </div>
      <span className={`justify-self-end shrink-0 rounded-full py-2 text-[14px] font-semibold leading-none ${statusPadding} ${statusStyle}`}>{displayedStatus}</span>
    </button>
  );
};
const formatRelativeTime = (createdAt) => {
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
  if (elapsedMinutes < 1) return '지금';
  if (elapsedMinutes < 60) return `${elapsedMinutes}분 전`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  return elapsedHours < 24 ? `${elapsedHours}시간 전` : `${Math.floor(elapsedHours / 24)}일 전`;
};

const NotificationPanel = ({ errorMessage, isLoading, notifications, onClose, onSelect }) => (
  <>
    <button aria-label="알림창 닫기" className="notification-backdrop fixed inset-x-0 bottom-[82px] top-0 z-40 cursor-default bg-black/25" onClick={onClose} type="button" />
    <section aria-labelledby="notification-title" aria-modal="true" className="notification-sheet fixed inset-x-0 bottom-[82px] z-[60] mx-auto h-[calc(71dvh-82px)] min-h-[500px] max-w-[600px] overflow-y-auto rounded-t-[42px] bg-[#fffefb] px-6 pb-8 pt-7 shadow-[0_-4px_18px_rgba(0,0,0,0.05)]" role="dialog">
      <div className="relative flex items-center justify-center border-b border-[#cfcfcf] pb-6">
        <button aria-label="알림창 닫기" className="absolute left-0 rounded-full p-1 text-[#777] hover:bg-[#f2f2f2] focus-visible:outline-2 focus-visible:outline-primary" onClick={onClose} type="button">
          <FiX className="size-7" strokeWidth={1.8} />
        </button>
        <h2 className="text-[24px] font-extrabold tracking-[-0.04em] text-[#111]" id="notification-title">알림</h2>
      </div>
      {isLoading ? (
        <p className="py-10 text-center text-[16px] text-[#8a8a8a]">알림을 불러오는 중입니다...</p>
      ) : errorMessage ? (
        <p className="py-10 text-center text-[16px] font-semibold text-[#c65f55]">{errorMessage}</p>
      ) : notifications.length === 0 ? (
        <p className="py-10 text-center text-[16px] text-[#8a8a8a]">오늘 도착한 알림이 없습니다.</p>
      ) : (
        <ul>
          {notifications.map((notification) => (
            <li className="border-b border-[#d1d1d1]" key={notification.notificationId}>
              <button className="grid min-h-[90px] w-full grid-cols-[20px_minmax(0,1fr)_72px_16px] items-center gap-3 px-2 text-left hover:bg-[#faf8f2] focus-visible:outline-2 focus-visible:outline-primary" onClick={() => onSelect(notification)} type="button">
                <span aria-hidden="true" className={`size-5 shrink-0 rounded-full ${notification.read ? 'bg-[#dedede]' : 'bg-[#f1c856]'}`} />
                <span className="min-w-0 flex-1 truncate text-[16px] font-medium tracking-[-0.025em] text-[#4b4b4b]">{notification.content}</span>
                <span className="text-right text-[14px] font-medium whitespace-nowrap text-[#777]">{formatRelativeTime(notification.createdAt)}</span>
                <FiChevronRight aria-hidden="true" className="size-4 shrink-0 text-[#777]" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  </>
);
const MainPage = () => {
  const location = useLocation();
  const [routineUpdate] = useState(() => location.state?.routineUpdate ?? location.state?.alternativeMission ?? null);
  const [mainData, setMainData] = useState({ userName: '', todayRoutines: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationLoading, setIsNotificationLoading] = useState(true);
  const [notificationError, setNotificationError] = useState('');
  const [highlightedRoutineId, setHighlightedRoutineId] = useState(null);
  const [expandedRoutineId, setExpandedRoutineId] = useState(null);

  const apiRoutines = mainData.todayRoutines.map(normalizeRoutine).sort((a, b) => a.scheduledMinutes - b.scheduledMinutes);
  const displayedRoutines = apiRoutines.map((routine) => {
    if (routine.id !== routineUpdate?.routineId) return routine;
    if (routineUpdate.kind === 'rejected') return { ...routine, status: routineUpdate.status };

    return {
      ...routine,
      title: routineUpdate.title,
      time: routineUpdate.time ?? routine.time,
      status: routineUpdate.status,
      tone: routineUpdate.missionType === 'water' ? 'blue' : 'yellow',
      icon: routineUpdate.missionType === 'water' ? FiDroplet : LuDumbbell,
    };
  });
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const incompleteRoutines = displayedRoutines.filter(({ completed, status }) => !completed && !status.includes('완료'));
  const currentRoutine = incompleteRoutines.find(({ scheduledMinutes }) => scheduledMinutes >= nowMinutes)
    ?? incompleteRoutines[0]
    ?? displayedRoutines[0]
    ?? null;
  const routines = displayedRoutines.filter(({ id }) => id !== currentRoutine?.id);
  const CurrentRoutineIcon = currentRoutine?.icon ?? FiSmile;
  const completedRoutineCount = displayedRoutines.filter(({ completed, status }) => completed || status.includes('완료')).length;
  const totalRoutineCount = displayedRoutines.length;
  const routineAchievementRate = totalRoutineCount > 0
    ? Math.round((completedRoutineCount / totalRoutineCount) * 100)
    : 0;
  const isCurrentRoutineTime = currentRoutine
    ? Math.floor(currentRoutine.scheduledMinutes / 60) === now.getHours()
    : false;
  const isRoutineCompleted = Boolean(currentRoutine?.completed || currentRoutine?.status.includes('완료'));
  const hasTodayRoutines = displayedRoutines.length > 0;
  const hasUnreadNotifications = notifications.some(({ read }) => !read);


  useEffect(() => {
    let isActive = true;

    const loadMainPage = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const data = await getMainPage();
        if (isActive) setMainData({ userName: data?.userName ?? '', todayRoutines: data?.todayRoutines ?? [] });
      } catch (error) {
        if (isActive) setErrorMessage(error.message);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadMainPage();
    return () => { isActive = false; };
  }, [reloadKey]);

  useEffect(() => {
    let isActive = true;

    const loadNotifications = async () => {
      setIsNotificationLoading(true);
      setNotificationError('');
      try {
        let userId = localStorage.getItem('userId');
        if (!userId) {
          const profile = await getMyProfile();
          userId = profile?.id;
          if (userId) localStorage.setItem('userId', String(userId));
        }
        if (!userId) throw new Error('사용자 정보를 확인할 수 없습니다.');
        const data = await getTodayNotifications(userId);
        if (isActive) setNotifications(data?.notifications ?? []);
      } catch (error) {
        if (isActive) setNotificationError(error.message);
      } finally {
        if (isActive) setIsNotificationLoading(false);
      }
    };

    loadNotifications();
    return () => { isActive = false; };
  }, []);

  const handleCompleteRoutine = async () => {
    if (!currentRoutine || isCompleting) return;
    setIsCompleting(true);
    setErrorMessage('');
    try {
      await completeRoutine(currentRoutine.id);
      setMainData((current) => ({
        ...current,
        todayRoutines: current.todayRoutines.map((routine) => (
          routine.routineId === currentRoutine.id ? { ...routine, completed: true } : routine
        )),
      }));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsCompleting(false);
    }
  };
  const handleNotificationSelect = async (notification) => {
    if (!notification.read) {
      try {
        await readNotification(notification.notificationId);
        setNotifications((current) => current.map((item) => (
          item.notificationId === notification.notificationId ? { ...item, read: true } : item
        )));
      } catch (error) {
        setNotificationError(error.message);
        return;
      }
    }
    setIsNotificationOpen(false);
  };  useEffect(() => {
    if (!isNotificationOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsNotificationOpen(false);
    };
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isNotificationOpen]);

  return (
    <>
      <section className="font-pretendard mx-auto flex w-full max-w-[430px] flex-col self-start pb-5 pt-7">
        <header className="flex min-h-[64px] items-center justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-bold tracking-[-0.04em] text-[#303030]">안녕하세요, {mainData.userName || '회원'}님 <span aria-hidden="true">👋</span></h1>
            <p className="mt-1 text-[16px] tracking-[-0.025em] text-[#969696]">오늘도 꾸준히 이어가볼까요?</p>
          </div>
          <button aria-expanded={isNotificationOpen} aria-label={hasUnreadNotifications ? '읽지 않은 알림 보기' : '알림 보기'} className="relative shrink-0 rounded-full p-2 text-[#303030] hover:bg-[#f5f1e7] focus-visible:outline-2 focus-visible:outline-primary" onClick={() => setIsNotificationOpen(true)} type="button">
            <FiBell className="size-8" strokeWidth={2.2} />
            {hasUnreadNotifications && <span aria-hidden="true" className="absolute right-1 top-1 size-2.5 rounded-full bg-[#f4d15d] ring-2 ring-[#fffdf7]" />}
          </button>
        </header>

        <article className="relative mt-6 min-h-[154px] overflow-hidden rounded-[24px] border-2 border-[#eee4cc] bg-white px-5 py-4 shadow-[0_3px_8px_rgba(95,75,28,0.04)]">
          <div className="relative z-10">
            <p className="text-[16px] font-bold text-[#252525]">오늘의 루틴 달성률</p>
            <strong className="mt-1 block text-[32px] leading-none text-[#292929]">{routineAchievementRate}%</strong>
            <p className="mt-1 text-[14px] text-[#929292]">{completedRoutineCount} / {totalRoutineCount} 완료</p>
          </div>
          <img alt="루틴 달성을 응원하는 햄스터" className="absolute bottom-5 right-[11%] z-10 h-[104px] w-auto object-contain" src="/assets/images/hamster1.png" />
          <div aria-label={`오늘의 루틴 달성률 ${routineAchievementRate}%`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={routineAchievementRate} className="absolute inset-x-4 bottom-6 h-[11px] overflow-hidden rounded-full border border-[#dfca8e] bg-white" role="progressbar">
            <div className="h-full rounded-full bg-[#f4cf56] transition-[width] duration-300" style={{ width: `${routineAchievementRate}%` }} />
          </div>
        </article>

        <h2 className="mt-6 text-[24px] font-bold tracking-[-0.04em] text-[#292929]">오늘의 루틴</h2>

        {isLoading ? (
          <div className="mt-5 flex min-h-[180px] items-center justify-center rounded-[24px] border border-[#ece9e2] bg-white px-6 text-center shadow-[0_2px_6px_rgba(44,44,44,0.03)]">
            <p className="text-[16px] font-semibold text-[#8a8a8a]">오늘의 루틴을 불러오는 중입니다...</p>
          </div>
        ) : errorMessage ? (
          <div className="mt-5 flex min-h-[180px] flex-col items-center justify-center gap-4 rounded-[24px] border border-[#f0c7c2] bg-white px-6 text-center shadow-[0_2px_6px_rgba(44,44,44,0.03)]">
            <p className="text-[16px] font-semibold text-[#c65f55]">{errorMessage}</p>
            <button className="rounded-full bg-[#f4d15d] px-6 py-3 text-[14px] font-bold text-[#37322a]" onClick={() => setReloadKey((current) => current + 1)} type="button">다시 시도</button>
          </div>
        ) : !hasTodayRoutines ? (
          <div className="mt-5 flex min-h-[180px] items-center justify-center rounded-[24px] border border-[#ece9e2] bg-white px-6 text-center shadow-[0_2px_6px_rgba(44,44,44,0.03)]">
            <p className="text-[16px] font-semibold text-[#8a8a8a]">현재 등록된 루틴이 없습니다</p>
          </div>
        ) : (
          <>

        <article className={`mt-5 rounded-[24px] border-2 bg-[#fffdf2] px-5 shadow-[0_5px_10px_rgba(170,136,36,0.08)] ${highlightedRoutineId === currentRoutine.id ? 'border-[#e78d84]' : 'border-[#f2d984]'} ${isRoutineCompleted ? 'py-6' : 'pb-7 pt-9'}`} data-routine-id={currentRoutine.id} onClick={() => setHighlightedRoutineId(null)}>
          <div className="grid grid-cols-[48px_minmax(0,1fr)_76px] items-center gap-3">
            <div className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-[#fff1b9] text-[#8877ef]">
              <CurrentRoutineIcon className="size-8" strokeWidth={3} />
              <span className="absolute right-0 top-0 size-2.5 rounded-full bg-[#f0bf64]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-semibold tracking-[-0.03em] text-[#777268]">{isCurrentRoutineTime ? '지금 수행할 시간이에요!' : '다음 루틴이에요!'}</p>
              <h3 className="text-[32px] font-extrabold leading-tight tracking-[-0.05em] text-[#181818]">{currentRoutine.title}</h3>
              <p className="text-[16px] font-semibold text-[#929292]">{currentRoutine.time}</p>
            </div>
            <span className={`w-[76px] justify-self-end rounded-full px-3 py-2 text-center text-[14px] font-semibold ${isRoutineCompleted ? 'bg-[#d9f2d5] text-[#64a56e]' : 'bg-[#eeeef0] text-[#838383]'}`}>{isRoutineCompleted ? '완료' : isCurrentRoutineTime ? '진행중' : '대기'}</span>
          </div>
          {!isRoutineCompleted && (
            isCurrentRoutineTime ? (
              <div className="mt-7 grid grid-cols-2 gap-3">
                <button className="flex min-h-[58px] items-center justify-center gap-2 rounded-full bg-[#f4d15d] px-3 text-[16px] font-bold text-[#37322a] shadow-[0_4px_8px_rgba(178,145,49,0.18)] active:scale-[0.98]" disabled={isCompleting} onClick={handleCompleteRoutine} type="button">
                  <FiCheck className="size-5" strokeWidth={2.5} /> {isCompleting ? '처리 중...' : '완료했어요'}
                </button>
                <button className="min-h-[58px] rounded-full border border-[#e6e6e6] bg-white px-3 text-[16px] font-bold text-[#444] shadow-[0_3px_8px_rgba(44,44,44,0.09)] active:scale-[0.98]" type="button">못 지킬 것 같아요</button>
              </div>
            ) : (
              <div className="mt-7">
                <button className="min-h-[58px] w-full rounded-full border border-[#e6e6e6] bg-white px-3 text-[16px] font-bold text-[#444] shadow-[0_3px_8px_rgba(44,44,44,0.09)] active:scale-[0.98]" type="button">못 지킬 것 같아요</button>
              </div>
            )
          )}
        </article>

        <div className="mt-6 flex flex-col gap-3">
          {routines.map((routine) => (
            <RoutineItem
              {...routine}
              isExpanded={expandedRoutineId === routine.id}
              isHighlighted={highlightedRoutineId === routine.id}
              key={routine.id}
              onToggle={() => { setHighlightedRoutineId(null); setExpandedRoutineId((current) => current === routine.id ? null : routine.id); }}
              status={routine.status}
            />
          ))}
        </div>
          </>
        )}
      </section>
      {isNotificationOpen && <NotificationPanel errorMessage={notificationError} isLoading={isNotificationLoading} notifications={notifications} onClose={() => setIsNotificationOpen(false)} onSelect={handleNotificationSelect} />}
    </>
  );
};

export default MainPage;
