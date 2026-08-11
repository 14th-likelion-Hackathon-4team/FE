import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DeleteConfirmDialog from '@/pages/RoutinePage/components/DeleteConfirmDialog';

const detailRoutine = {
  name: '루틴명 텍스트',
  repeatLabel: '월 · 수 · 금',
  timeLabel: '오전 7:30',
  periodLabel: '2026.07.01 ~ 없음',
  notificationLabel: 'ON · 정시',
  active: true,
};

const RoutineDetailPage = () => {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const [active, setActive] = useState(detailRoutine.active);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const infoRows = [
    ['반복 주기', detailRoutine.repeatLabel],
    ['수행 시간', detailRoutine.timeLabel],
    ['기간', detailRoutine.periodLabel],
    ['알림', detailRoutine.notificationLabel],
  ];

  const handleClose = () => navigate('/routines');
  const handleEdit = () => navigate(`/routines/${routineId}/edit`);

  const handleConfirmDelete = () => {
    setDeleteOpen(false);
    navigate('/routines', { replace: true });
  };

  const handlePauseInstead = () => {
    setActive(false);
    setDeleteOpen(false);
  };

  return (
    <>
      <section aria-label="루틴 상세" className="flex min-h-[816px] w-[402px] min-w-[402px] max-w-[402px] shrink-0 flex-col self-start bg-background pb-10">
        <header className="grid h-[43px] shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-text-main px-[17px]">
          <button aria-label="루틴 목록으로 닫기" className="justify-self-start text-[24px] font-bold leading-none text-text-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={handleClose} type="button">×</button>
          <h1 className="text-[18px] font-bold text-text-main">루틴 상세</h1>
          <span aria-hidden="true" />
        </header>

        <div className="px-[17px] pt-[17px]">
          <h2 className="text-[20px] font-bold text-text-main">{detailRoutine.name}</h2>

          <div className="mt-2.5 flex items-center gap-2.5">
            <button aria-label="루틴 활성 상태" aria-pressed={active} className="relative h-6 w-[42px] shrink-0 rounded-full border border-primary-soft bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={() => setActive((current) => !current)} type="button">
              <span aria-hidden="true" className={`absolute left-[2px] top-[2px] size-[18px] rounded-full border border-primary-soft transition-transform ${active ? 'translate-x-[19px] bg-primary' : 'translate-x-0 bg-surface'}`} />
            </button>
            <span className="text-[13px] font-medium text-text-main">활성 상태 · 끄면 일시중지</span>
          </div>

          <dl className="mt-4 rounded-2xl border border-primary-soft bg-surface">
            {infoRows.map(([label, value], index) => (
              <div key={label} className={`flex h-[38px] items-center justify-between px-4 ${index > 0 ? 'border-t border-primary-soft' : ''}`}>
                <dt className="text-[14px] font-medium text-text-main">{label}</dt>
                <dd className="text-[14px] font-medium text-text-main">{value}</dd>
              </div>
            ))}
          </dl>

          <h3 className="mt-5 text-[13px] font-medium text-text-main">최근 4주 수행</h3>
          <div aria-label="최근 4주 수행 기록" className="mt-2 h-[86px] rounded-xl border border-primary-soft bg-surface" role="img" />
        </div>

        <div className="mt-auto flex gap-3.5 px-[17px] pt-10">
          <button className="h-[54px] w-[90px] shrink-0 rounded-xl border border-primary-soft bg-surface text-[15px] font-semibold text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={() => setDeleteOpen(true)} type="button">삭제</button>
          <button className="h-[54px] flex-1 rounded-xl border border-primary-soft bg-primary text-[16px] font-bold text-text-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={handleEdit} type="button">수정하기</button>
        </div>
      </section>

      <DeleteConfirmDialog onCancel={() => setDeleteOpen(false)} onConfirm={handleConfirmDelete} onPause={handlePauseInstead} routine={deleteOpen ? detailRoutine : null} />
    </>
  );
};

export default RoutineDetailPage;
