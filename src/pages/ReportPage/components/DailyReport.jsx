const RoutineStatus = ({ status }) => {
  if (status === 'done') {
    return (
      <span
        aria-label="완료"
        className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-text-main"
      >
        ✓
      </span>
    );
  }

  if (status === 'alternative') {
    return <span aria-label="대체 미션 완료" className="size-[22px] shrink-0 rounded-full bg-disabled" />;
  }

  return <span aria-label="미완료" className="size-[22px] shrink-0 rounded-full border border-dashed border-text-muted" />;
};

const DailyReport = ({ report }) => {
  return (
    <section aria-labelledby="daily-report-title" className="mt-[22px] w-full">
      <h2 id="daily-report-title" className="text-[18px] font-bold text-text-main">
        {report.dateLabel}
      </h2>
      <p className="mt-1 text-[11px] text-text-muted">총 {report.completedCount}개 완료</p>

      <div
        aria-label={`계획 ${report.counts.plan}, 대체 미션 ${report.counts.alternative}, 미완료 ${report.counts.incomplete}`}
        className="mt-[10px] flex h-[10px] overflow-hidden rounded-xl border border-primary-soft bg-surface"
        role="img"
      >
        <span className="h-full bg-disabled" style={{ width: `${report.progress.plan}%` }} />
        <span className="h-full bg-primary" style={{ width: `${report.progress.alternative}%` }} />
      </div>

      <div className="mt-1.5 flex gap-7 text-[10px] text-text-muted">
        <span>계획 {report.counts.plan}</span>
        <span>대체 미션 {report.counts.alternative}</span>
        <span>미완료 {report.counts.incomplete}</span>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {report.routines.map((routine) => (
          <li
            key={routine.id}
            className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-primary-soft bg-surface px-3.5 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium text-text-main">{routine.name}</p>
              {routine.description && (
                <p className="mt-0.5 truncate text-[10px] text-text-muted">{routine.description}</p>
              )}
            </div>
            <RoutineStatus status={routine.status} />
          </li>
        ))}
      </ul>

      <p className="mt-4 rounded-xl border border-primary-soft bg-surface px-4 py-[14px] text-[12px] text-[#141414]">
        {report.feedback}
      </p>
    </section>
  );
};

export default DailyReport;
