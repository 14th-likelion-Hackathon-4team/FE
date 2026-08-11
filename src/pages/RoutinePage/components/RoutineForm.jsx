import { useState } from 'react';

const weekdays = ['월', '화', '수', '목', '금', '토', '일'];

const createEmptyRoutine = () => ({
  name: '',
  repeatType: 'days',
  days: ['월', '수', '금'],
  time: '07:30',
  startDate: '2026-08-03',
  endDate: '',
  notificationEnabled: true,
  notificationTiming: '정시',
  active: true,
});

const RoutineForm = ({ mode, initialRoutine, onCancel, onSave, onDelete }) => {
  const [draft, setDraft] = useState(() => initialRoutine ?? createEmptyRoutine());

  const canSave = draft.name.trim().length > 0 && (draft.repeatType !== 'days' || draft.days.length > 0);
  const updateDraft = (property, value) => setDraft((current) => ({ ...current, [property]: value }));
  const handleDayToggle = (day) => setDraft((current) => ({ ...current, days: current.days.includes(day) ? current.days.filter((item) => item !== day) : [...current.days, day] }));
  const handleSubmit = (event) => { event.preventDefault(); if (canSave) onSave({ ...draft, name: draft.name.trim() }); };
  const title = mode === 'create' ? '새 루틴' : '루틴 수정';

  return (
    <section aria-label={title} className="flex min-h-[792px] w-[402px] min-w-[402px] max-w-[402px] shrink-0 flex-col self-start bg-background pb-10">
        <header className="grid h-[43px] grid-cols-[1fr_auto_1fr] items-center border-b border-text-main px-[17px]">
          <button aria-label="루틴 목록으로 닫기" className="justify-self-start text-[24px] font-bold leading-none text-text-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={onCancel} type="button">×</button>
          <h1 className="text-[18px] font-bold text-text-main">{title}</h1>
          <span aria-hidden="true" />
        </header>

        <form className="flex flex-1 flex-col px-[17px] pb-5 pt-[17px]" id="routine-form" onSubmit={handleSubmit}>
          <label className="text-[13px] font-medium text-text-main" htmlFor="routine-name">루틴명 *</label>
          <input className="mt-2 h-[54px] rounded-xl border border-primary-soft bg-surface px-4 text-[15px] font-semibold text-text-main outline-none placeholder:text-text-muted focus:border-primary" id="routine-name" maxLength={20} onChange={(event) => updateDraft('name', event.target.value)} placeholder="예: 아침 스트레칭" value={draft.name} />
          <p className="mt-1 text-right text-[11px] text-text-muted">{draft.name.length} / 20</p>

          <fieldset className="mt-5"><legend className="text-[13px] font-medium text-text-main">반복 주기 *</legend><div className="mt-2 grid grid-cols-3 gap-1.5">{[['days', '요일 선택'], ['daily', '매일'], ['count', '주 N회']].map(([value, label]) => <button key={value} aria-pressed={draft.repeatType === value} className={`h-[38px] rounded-xl border text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${draft.repeatType === value ? 'border-primary-soft bg-primary font-bold text-text-main' : 'border-primary-soft bg-surface font-medium text-text-main'}`} onClick={() => updateDraft('repeatType', value)} type="button">{label}</button>)}</div>{draft.repeatType !== 'daily' && <div className="mt-2 grid grid-cols-7 gap-[5px]">{weekdays.map((day) => <button key={day} aria-pressed={draft.days.includes(day)} className={`h-[46px] rounded-xl border text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${draft.days.includes(day) ? 'border-primary-soft bg-primary font-bold text-text-main' : 'border-primary-soft bg-surface font-medium text-text-main'}`} onClick={() => handleDayToggle(day)} type="button">{day}</button>)}</div>}</fieldset>

          <label className="mt-5 text-[13px] font-medium text-text-main" htmlFor="routine-time">수행 시간 *</label>
          <input className="mt-2 h-[54px] rounded-xl border border-primary-soft bg-surface px-4 text-[15px] font-semibold text-text-main outline-none focus:border-primary" id="routine-time" onChange={(event) => updateDraft('time', event.target.value)} type="time" value={draft.time} />

          <fieldset className="mt-5"><legend className="text-[13px] font-medium text-text-main">기간</legend><div className="mt-2 grid grid-cols-2 gap-2.5"><label className="text-[11px] text-text-muted" htmlFor="routine-start-date">시작일<input className="mt-1 block h-[50px] w-full rounded-xl border border-primary-soft bg-surface px-3 text-[14px] font-medium text-text-main outline-none focus:border-primary" id="routine-start-date" onChange={(event) => updateDraft('startDate', event.target.value)} type="date" value={draft.startDate} /></label><label className="text-[11px] text-text-muted" htmlFor="routine-end-date">종료일 (선택)<input className="mt-1 block h-[50px] w-full rounded-xl border border-primary-soft bg-surface px-3 text-[14px] font-medium text-text-main outline-none focus:border-primary" id="routine-end-date" onChange={(event) => updateDraft('endDate', event.target.value)} type="date" value={draft.endDate} /></label></div></fieldset>

          <section className="mt-5" aria-labelledby="notification-title"><h2 className="text-[13px] font-medium text-text-main" id="notification-title">알림</h2><div className="mt-2 rounded-2xl border border-primary-soft bg-surface"><div className="flex h-[53px] items-center justify-between px-4"><span className="text-[15px] font-semibold text-text-main">푸시 알림 받기</span><button aria-label="푸시 알림 받기" aria-pressed={draft.notificationEnabled} className="relative h-6 w-[42px] rounded-full border border-primary-soft bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={() => updateDraft('notificationEnabled', !draft.notificationEnabled)} type="button"><span aria-hidden="true" className={`absolute left-[2px] top-[2px] size-[18px] rounded-full border border-primary-soft transition-transform ${draft.notificationEnabled ? 'translate-x-[19px] bg-primary' : 'translate-x-0 bg-surface'}`} /></button></div><div className="border-t border-primary-soft" /><label className="flex h-[52px] items-center justify-between px-4 text-[14px] font-medium text-text-main" htmlFor="notification-timing">알림 시점<select className="appearance-none bg-surface text-right text-[14px] font-medium text-text-main outline-none" disabled={!draft.notificationEnabled} id="notification-timing" onChange={(event) => updateDraft('notificationTiming', event.target.value)} value={draft.notificationTiming}><option>정시</option><option>10분 전</option><option>30분 전</option></select></label></div><p className="mt-2 text-[10px] text-text-muted">무응답 시 1시간 뒤 1회 재알림</p></section>

          {mode === 'edit' && <button className="mt-7 h-[54px] rounded-xl border border-danger bg-surface text-[15px] font-semibold text-text-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={() => onDelete(initialRoutine.id)} type="button">루틴 삭제</button>}
          <div className="mt-auto bg-background pb-1 pt-7"><button className="h-[54px] w-full rounded-xl border border-primary-soft bg-primary text-[16px] font-bold text-text-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:bg-disabled" disabled={!canSave} type="submit">{mode === 'create' ? '저장하기' : '수정하기'}</button></div>
        </form>
    </section>
  );
};

export default RoutineForm;
