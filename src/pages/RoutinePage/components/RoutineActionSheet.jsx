import { useEffect } from 'react';

const RoutineActionSheet = ({ routine, onClose, onEdit, onToggleActive, onDelete }) => {
  useEffect(() => {
    if (!routine) return undefined;
    const handleKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, routine]);

  if (!routine) return null;

  return (
    <div aria-modal="true" className="fixed inset-0 z-[60] bg-text-main/20" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }} role="dialog">
      <section aria-label={`${routine.name} 작업`} className="absolute bottom-0 left-1/2 h-72 w-[370px] -translate-x-1/2 rounded-t-[20px] border border-primary-soft bg-surface px-[15px] pt-3">
        <div aria-hidden="true" className="mx-auto h-1 w-[62px] rounded-full border border-primary-soft bg-surface" />
        <p className="mt-3 text-[13px] font-medium text-text-main">{routine.name}</p>
        <div className="mt-5 grid gap-2.5">
          <button className="h-11 rounded-xl border border-primary-soft bg-surface text-[16px] font-semibold text-text-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={() => onEdit(routine.id)} type="button">수정하기</button>
          <button className="h-11 rounded-xl border border-primary-soft bg-surface text-[16px] font-semibold text-text-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={() => { onToggleActive(routine.id); onClose(); }} type="button">{routine.active ? '일시중지' : '재개하기'}</button>
          <button className="h-11 rounded-xl border border-danger bg-surface text-[16px] font-semibold text-text-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={() => onDelete(routine.id)} type="button">삭제하기</button>
          <button className="h-11 rounded-xl border border-primary-soft bg-surface text-[16px] font-semibold text-text-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={onClose} type="button">닫기</button>
        </div>
      </section>
    </div>
  );
};

export default RoutineActionSheet;
