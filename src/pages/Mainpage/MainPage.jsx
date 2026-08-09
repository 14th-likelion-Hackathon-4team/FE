import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiBell, FiCheck, FiChevronRight, FiDroplet, FiHeart, FiSmile, FiX } from 'react-icons/fi';
import { LuDumbbell } from 'react-icons/lu';

const mockUser = { nickname: '00' };

const routines = [
  { id: 'morning-meal', title: '아침 식단', time: '08:00', status: '완료', tone: 'green', icon: FiSmile },
  { id: 'water', title: '물 2L 마시기', time: '13:00', status: '대체 미션 완료', tone: 'blue', icon: FiDroplet },
  { id: 'evening-meal', title: '저녁 식단', time: '21:00', status: '대기', tone: 'green', icon: FiSmile },
  { id: 'skin-care', title: '스킨 케어', time: '23:00', status: '대기', tone: 'red', icon: FiHeart },
];
const currentRoutine = {
  id: 'evening-exercise',
  title: '저녁 운동',
  time: '19:00',
  status: 'IN_PROGRESS',
};

const notifications = [
  { id: 2, time: '6시간 전', routineId: 'water' },
  { id: 1, time: '11시간 전', routineId: 'morning-meal' },
];

const getRoutineTitle = (routineId) =>
  [...(currentRoutine ? [currentRoutine] : []), ...routines].find(({ id }) => id === routineId)?.title ?? '루틴';

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
const NotificationPanel = ({ onClose, onSelect, unreadNotificationIds }) => (
  <>
    <button aria-label="알림창 닫기" className="notification-backdrop fixed inset-x-0 bottom-[82px] top-0 z-40 cursor-default bg-black/25" onClick={onClose} type="button" />
    <section aria-labelledby="notification-title" aria-modal="true" className="notification-sheet fixed inset-x-0 bottom-[82px] z-[60] mx-auto h-[calc(71dvh-82px)] min-h-[500px] max-w-[600px] overflow-y-auto rounded-t-[42px] bg-[#fffefb] px-6 pb-8 pt-7 shadow-[0_-4px_18px_rgba(0,0,0,0.05)]" role="dialog">
      <div className="relative flex items-center justify-center border-b border-[#cfcfcf] pb-6">
        <button aria-label="알림창 닫기" className="absolute left-0 rounded-full p-1 text-[#777] hover:bg-[#f2f2f2] focus-visible:outline-2 focus-visible:outline-primary" onClick={onClose} type="button">
          <FiX className="size-7" strokeWidth={1.8} />
        </button>
        <h2 className="text-[24px] font-extrabold tracking-[-0.04em] text-[#111]" id="notification-title">알림</h2>
      </div>
      <ul>
        {notifications.map((notification) => (
          <li className="border-b border-[#d1d1d1]" key={notification.id}>
            <button className="grid min-h-[90px] w-full grid-cols-[20px_minmax(0,1fr)_72px_16px] items-center gap-3 px-2 text-left hover:bg-[#faf8f2] focus-visible:outline-2 focus-visible:outline-primary" onClick={() => onSelect(notification)} type="button">
              <span aria-hidden="true" className={`size-5 shrink-0 rounded-full ${unreadNotificationIds.includes(notification.id) ? 'bg-[#f1c856]' : 'bg-[#dedede]'}`} />
              <span className="min-w-0 flex-1 truncate text-[16px] font-medium tracking-[-0.025em] text-[#4b4b4b]">{`${mockUser.nickname}님, 오늘 ${getRoutineTitle(notification.routineId)} 어떠세요?`}</span>
              <span className="text-right text-[14px] font-medium whitespace-nowrap text-[#777]">{notification.time}</span>
              <FiChevronRight aria-hidden="true" className="size-4 shrink-0 text-[#777]" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  </>
);

const MainPage = () => {
  const location = useLocation();
  const [routineUpdate] = useState(() => location.state?.routineUpdate ?? location.state?.alternativeMission ?? null);
  const displayedRoutines = routines.map((routine) => {
    if (routine.id !== routineUpdate?.routineId) return routine;
    if (routineUpdate.kind === 'rejected') return { ...routine, status: routineUpdate.status };

    return {
      ...routine,
      title: routineUpdate.title,
      time: routineUpdate.time ?? routine.time,
      status: routineUpdate.status,
      tone: 'yellow',
      icon: LuDumbbell,
    };
  });
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isRoutineCompleted, setIsRoutineCompleted] = useState(false);
  const [highlightedRoutineId, setHighlightedRoutineId] = useState(null);
  const [unreadNotificationIds, setUnreadNotificationIds] = useState(() => notifications.map(({ id }) => id));
  const hasUnreadNotifications = unreadNotificationIds.length > 0;
  const [expandedRoutineId, setExpandedRoutineId] = useState(null);
  const [completedRoutineIds] = useState(() =>
    routines.filter(({ status }) => status.includes('완료')).map(({ id }) => id),
  );
  const hasTodayRoutines = Boolean(currentRoutine) || routines.length > 0;
  const completedRoutineCount = completedRoutineIds.length + (currentRoutine && isRoutineCompleted ? 1 : 0);
  const totalRoutineCount = routines.length + (currentRoutine ? 1 : 0);
  const routineAchievementRate = totalRoutineCount > 0
    ? Math.round((completedRoutineCount / totalRoutineCount) * 100)
    : 0;
  const isCurrentRoutineTime = currentRoutine?.status === 'IN_PROGRESS';

  const handleNotificationSelect = ({ id, routineId }) => {
    setUnreadNotificationIds((current) => current.filter((notificationId) => notificationId !== id));
    setIsNotificationOpen(false);
    setHighlightedRoutineId(routineId);
    window.setTimeout(() => {
      document.querySelector(`[data-routine-id="${routineId}"]`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 50);
  };
  useEffect(() => {
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
            <h1 className="text-[24px] font-bold tracking-[-0.04em] text-[#303030]">안녕하세요, {mockUser.nickname}님 <span aria-hidden="true">👋</span></h1>
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

        {!hasTodayRoutines ? (
          <div className="mt-5 flex min-h-[180px] items-center justify-center rounded-[24px] border border-[#ece9e2] bg-white px-6 text-center shadow-[0_2px_6px_rgba(44,44,44,0.03)]">
            <p className="text-[16px] font-semibold text-[#8a8a8a]">현재 등록된 루틴이 없습니다</p>
          </div>
        ) : (
          <>

        <article className={`mt-5 rounded-[24px] border-2 bg-[#fffdf2] px-5 shadow-[0_5px_10px_rgba(170,136,36,0.08)] ${highlightedRoutineId === currentRoutine.id ? 'border-[#e78d84]' : 'border-[#f2d984]'} ${isRoutineCompleted ? 'py-6' : 'pb-7 pt-9'}`} data-routine-id={currentRoutine.id} onClick={() => setHighlightedRoutineId(null)}>
          <div className="grid grid-cols-[48px_minmax(0,1fr)_76px] items-center gap-3">
            <div className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-[#fff1b9] text-[#8877ef]">
              <LuDumbbell className="size-8 rotate-[-40deg]" strokeWidth={3} />
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
                <button className="flex min-h-[58px] items-center justify-center gap-2 rounded-full bg-[#f4d15d] px-3 text-[16px] font-bold text-[#37322a] shadow-[0_4px_8px_rgba(178,145,49,0.18)] active:scale-[0.98]" onClick={() => setIsRoutineCompleted(true)} type="button">
                  <FiCheck className="size-5" strokeWidth={2.5} /> 완료했어요
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
          {displayedRoutines.map((routine) => (
            <RoutineItem
              {...routine}
              isExpanded={expandedRoutineId === routine.id}
              isHighlighted={highlightedRoutineId === routine.id}
              key={routine.id}
              onToggle={() => { setHighlightedRoutineId(null); setExpandedRoutineId((current) => current === routine.id ? null : routine.id); }}
              status={completedRoutineIds.includes(routine.id) && !routine.status.includes('완료') ? '완료' : routine.status}
            />
          ))}
        </div>
          </>
        )}
      </section>
      {isNotificationOpen && <NotificationPanel onClose={() => setIsNotificationOpen(false)} onSelect={handleNotificationSelect} unreadNotificationIds={unreadNotificationIds} />}
    </>
  );
};

export default MainPage;
