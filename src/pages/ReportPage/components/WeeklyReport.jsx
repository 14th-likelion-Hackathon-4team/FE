const tagClassNames = {
  success: 'bg-success',
  danger: 'bg-danger',
  neutral: 'bg-background',
};

const WeeklyReport = ({
  summary,
  weekdayRates,
  causeTags,
  suggestion,
  isApplied,
  onApplySuggestion,
  onNextSuggestion,
}) => {
  return (
    <section aria-labelledby="weekly-report-title" className="mt-7 w-full">
      <h2 id="weekly-report-title" className="text-[18px] font-bold text-text-main">
        이번 주
      </h2>

      <div className="mt-3 rounded-2xl border border-primary-soft bg-surface p-4">
        <div className="flex items-center gap-6">
          <strong className="text-[26px] leading-none text-text-main">{summary.completionRate}%</strong>
          <span className="text-[11px] text-text-muted">지난주 대비 {summary.change}</span>
          <span className="ml-auto text-[10px] text-text-muted">{summary.dateRange}</span>
        </div>

        <div
          aria-label={`계획 ${summary.planRate}%, 대체 미션 ${summary.alternativeRate}%`}
          className="mt-4 h-[10px] overflow-hidden rounded-xl border border-primary-soft bg-surface"
          role="img"
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${summary.completionRate}%` }} />
        </div>
        <div className="mt-1 flex gap-9 text-[9px] text-text-muted">
          <span>계획 {summary.planRate}%</span>
          <span>대체 미션 {summary.alternativeRate}%</span>
        </div>
      </div>

      <h3 className="mt-6 text-[16px] font-bold text-text-main">요일별 패턴</h3>
      <div className="mt-4 grid grid-cols-7 gap-1.5" role="img" aria-label="요일별 루틴 달성률">
        {weekdayRates.map((day) => (
          <div key={day.weekday} className="flex min-w-0 flex-col items-center">
            <div className="flex h-[62px] w-full items-end">
              <span
                className="w-full rounded-lg bg-primary"
                style={{ height: `${Math.max(day.rate, 12)}%` }}
              />
            </div>
            <span className="mt-2 text-[10px] text-text-muted">{day.weekday}</span>
          </div>
        ))}
      </div>

      <h3 className="mt-5 text-[12px] font-normal text-text-muted">원인 태그 분포</h3>
      <ul className="mt-3 flex flex-wrap gap-4">
        {causeTags.map((tag) => (
          <li
            key={tag.label}
            className={`rounded-lg border border-primary-soft px-2 py-1.5 text-[11px] text-text-muted ${tagClassNames[tag.tone]}`}
          >
            {tag.label} {tag.count}
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-2xl border border-primary-soft bg-surface p-4">
        <p className="text-[11px] text-text-muted">AI 루틴 재설계 제안</p>
        <p className="mt-3 min-h-10 whitespace-pre-line text-[13px] font-medium leading-[1.45] text-[#141414]">
          {suggestion.message}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            className="h-[46px] rounded-xl border border-primary-soft bg-primary text-[14px] font-bold text-text-main disabled:bg-disabled"
            disabled={isApplied}
            onClick={onApplySuggestion}
            type="button"
          >
            {isApplied ? '적용 완료' : '적용하기'}
          </button>
          <button
            className="h-[46px] rounded-xl border border-primary-soft bg-surface text-[14px] font-bold text-text-main"
            onClick={onNextSuggestion}
            type="button"
          >
            다른 제안
          </button>
        </div>
      </div>
    </section>
  );
};

export default WeeklyReport;
