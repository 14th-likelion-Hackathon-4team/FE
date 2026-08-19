const WeeklyReport = ({ summary, weekdayRates }) => {
  return (
    <section aria-labelledby="weekly-report-title" className="mt-7 w-full">
      <h2
        id="weekly-report-title"
        className="text-[18px] font-bold text-text-main"
      >
        이번 주
      </h2>

      <div className="mt-3 rounded-2xl border border-primary-soft bg-surface p-4">
        <div className="flex items-center gap-6">
          <strong className="text-[26px] leading-none text-text-main">
            {summary.completionRate}%
          </strong>
          <span className="text-[11px] text-text-muted">
            지난주 대비 {summary.change}
          </span>
          <span className="ml-auto text-[10px] text-text-muted">
            {summary.dateRange}
          </span>
        </div>

        <div
          aria-label={`계획 ${summary.planRate}%, 대체 미션 ${summary.alternativeRate}%`}
          className="mt-4 flex h-[10px] overflow-hidden rounded-xl border border-primary-soft bg-surface"
          role="img"
        >
          <span
            className="h-full bg-primary"
            style={{ width: `${summary.planRate}%` }}
          />
          <span
            className="h-full bg-primary-soft"
            style={{ width: `${summary.alternativeRate}%` }}
          />
        </div>
        <div className="mt-1 flex gap-9 text-[9px] text-text-muted">
          <span>계획 {summary.planRate}%</span>
          <span>대체 미션 {summary.alternativeRate}%</span>
        </div>
      </div>

      <h3 className="mt-6 text-[16px] font-bold text-text-main">요일별 패턴</h3>
      <div
        className="mt-4 grid grid-cols-7 gap-1.5"
        role="img"
        aria-label="요일별 루틴 달성률"
      >
        {weekdayRates.map((day) => (
          <div key={day.weekday} className="flex min-w-0 flex-col items-center">
            <div className="flex h-[62px] w-full items-end">
              <span
                className="w-full rounded-lg bg-primary"
                style={{ height: `${Math.max(day.rate, 12)}%` }}
              />
            </div>
            <span className="mt-2 text-[10px] text-text-muted">
              {day.weekday}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WeeklyReport;
