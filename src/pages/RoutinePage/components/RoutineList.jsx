const weekdays = ['월', '화', '수', '목', '금', '토', '일'];

const formatTime = (time) => {
  const [hour, minute] = time.split(':').map(Number);
  const period = hour < 12 ? '오전' : '오후';
  return `${period} ${hour % 12 || 12}:${String(minute).padStart(2, '0')}`;
};

const getRoutineMeta = (routine) => {
  const repeatLabel = routine.repeatType === 'daily' ? '매일' : routine.repeatType === 'count' ? `주 ${routine.days.length}회` : routine.days.join('·');
  const stateLabel = routine.endDate ? `${Number(routine.endDate.slice(5, 7))}/${Number(routine.endDate.slice(8))} 종료` : routine.active ? `알림 ${routine.notificationEnabled ? 'ON' : 'OFF'}` : '일시중지';
  return `${repeatLabel} · ${stateLabel}`;
};

const RoutineCard = ({ routine, onToggle, onOpenActions, onSelect }) => (
  <article className="flex h-[68px] items-center gap-3 rounded-xl border border-primary-soft bg-surface px-3.5">
    <button className="min-w-0 flex-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={() => onSelect(routine.id)} type="button">
      <h2 className="truncate text-[17px] font-bold text-text-main">{routine.name}</h2>
      <p className="mt-1 truncate text-[12px] text-text-muted">{getRoutineMeta(routine)}</p>
    </button>
    <button aria-label={`${routine.name} ${routine.active ? '일시중지' : '활성화'}`} aria-pressed={routine.active} className="relative h-6 w-11 shrink-0 rounded-full border border-primary-soft bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={() => onToggle(routine.id)} type="button">
      <span aria-hidden="true" className={`absolute left-[2px] top-[2px] size-[18px] rounded-full border border-primary-soft transition-transform ${routine.active ? 'translate-x-[21px] bg-primary' : 'translate-x-0 bg-surface'}`} />
    </button>
    <button aria-label={`${routine.name} 더보기`} className="flex size-7 shrink-0 items-center justify-center text-[20px] font-bold leading-none text-text-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={() => onOpenActions(routine.id)} type="button">⋯</button>
  </article>
);

const RoutineEmptyState = ({ onOpenCreate }) => (
  <section className="mt-7 flex h-[548px] flex-col items-center rounded-2xl border border-primary-soft bg-surface px-6 pt-14 text-center">
    <img alt="루틴을 응원하는 햄스터" className="size-28 object-contain" src="/assets/images/hamster1.png" />
    <h2 className="mt-7 text-[18px] font-bold text-text-main">아직 등록한 루틴이 없어요</h2>
    <p className="mt-5 whitespace-pre-line text-[14px] font-medium leading-6 text-text-main">{'작게 시작해도 괜찮아요.\n첫 루틴을 하나만 만들어볼까요?'}</p>
    <button className="mt-11 h-[50px] rounded-xl border border-primary-soft bg-primary px-7 text-[15px] font-bold text-text-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={onOpenCreate} type="button">+ 첫 루틴 만들기</button>
  </section>
);

const RoutineList = ({ routines, selectedDay, onSelectDay, onToggleRoutine, onOpenActions, onOpenCreate, onSelectRoutine }) => {
  const routinesByTime = routines.reduce((groups, routine) => {
    const group = groups.find((item) => item.time === routine.time);
    if (group) {
      group.routines.push(routine);
      return groups;
    }
    return [...groups, { time: routine.time, routines: [routine] }];
  }, []);

  return (
    <section className="flex min-h-[792px] w-[402px] min-w-[402px] max-w-[402px] shrink-0 flex-col self-start bg-background pb-10">
      <header className="border-b border-text-main px-[17px] pb-[14px] pt-[17px]"><h1 className="text-[22px] font-bold text-text-main">루틴 관리</h1></header>
      <div className="border-b border-primary-soft px-[17px] pb-2.5 pt-2"><div className="grid grid-cols-7 gap-2">{weekdays.map((day) => <button key={day} aria-pressed={selectedDay === day} className={`h-[26px] rounded-full border text-[12px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selectedDay === day ? 'border-primary-soft bg-primary font-bold text-text-main' : 'border-primary-soft bg-surface text-text-muted'}`} onClick={() => onSelectDay(day)} type="button">{day}</button>)}</div></div>
      <div className="px-[17px] pt-2.5"><button aria-pressed={selectedDay === '전체'} className={`h-[26px] rounded-full border px-3 text-[12px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selectedDay === '전체' ? 'border-primary-soft bg-primary font-bold text-text-main' : 'border-primary-soft bg-surface text-text-muted'}`} onClick={() => onSelectDay('전체')} type="button">전체</button></div>
      {routinesByTime.length === 0 ? <div className="px-[17px]"><RoutineEmptyState onOpenCreate={onOpenCreate} /></div> : <div className="px-[17px]">{routinesByTime.map((group) => <section key={group.time} className="mt-5"><p className="border-b border-primary-soft pb-2 text-[12px] text-text-muted">{formatTime(group.time)}</p><div className="mt-2 flex flex-col gap-2">{group.routines.map((routine) => <RoutineCard key={routine.id} onOpenActions={onOpenActions} onSelect={onSelectRoutine} onToggle={onToggleRoutine} routine={routine} />)}</div></section>)}</div>}
      <div className="mt-auto px-[17px] pt-10"><button className="h-[54px] w-full rounded-xl border border-primary-soft bg-surface text-[16px] font-bold text-text-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={onOpenCreate} type="button">+ 새 루틴 만들기</button></div>
    </section>
  );
};

export default RoutineList;
