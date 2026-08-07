import { useState } from 'react';
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md';

const weekdays = ['월', '화', '수', '목', '금', '토', '일'];
const yearOptions = Array.from({ length: 16 }, (_, index) => 2020 + index);

const statusClassNames = {
  completed: { background: 'bg-primary', border: 'border-primary' },
  alternative: { background: 'bg-primary-soft', border: 'border-primary-soft' },
  incomplete: { background: 'bg-disabled', border: 'border-disabled' },
};

const toDateId = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateId = (dateId) => {
  const [year, month, day] = dateId.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const createCalendarDay = (date, viewYear, viewMonth, statusByDate, todayDate) => {
  const id = toDateId(date);

  return {
    id,
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    date: date.getDate(),
    isCurrentMonth: date.getFullYear() === viewYear && date.getMonth() + 1 === viewMonth,
    isToday: id === todayDate,
    status: statusByDate[id] ?? 'incomplete',
  };
};

const getWeekDays = (selectedDate, statusByDate, todayDate) => {
  const selected = parseDateId(selectedDate);
  const mondayOffset = (selected.getDay() + 6) % 7;
  const monday = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() - mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index);
    return createCalendarDay(date, date.getFullYear(), date.getMonth() + 1, statusByDate, todayDate);
  });
};

const getMonthDays = (year, month, statusByDate, todayDate) => {
  const firstDay = new Date(year, month - 1, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month - 1, 1 - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);
    return createCalendarDay(date, year, month, statusByDate, todayDate);
  });
};

const ReportCalendar = ({
  selectedDate,
  onSelectDate,
  statusByDate,
  todayDate,
  currentStreak,
  bestStreak,
}) => {
  const initialDate = parseDateId(selectedDate);
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth() + 1);

  const days = isExpanded
    ? getMonthDays(viewYear, viewMonth, statusByDate, todayDate)
    : getWeekDays(selectedDate, statusByDate, todayDate);

  const handleDateSelect = (day) => {
    onSelectDate(day.id);
    setViewYear(day.year);
    setViewMonth(day.month);
    setIsExpanded(false);
  };

  return (
    <section aria-label="리포트 날짜 선택" className="w-full">
      <div className="flex items-center pt-10">
        {isExpanded ? (
          <div className="flex items-center text-[18px] font-bold text-text-main">
            <label className="sr-only" htmlFor="report-year">
              연도
            </label>
            <select
              id="report-year"
              className="mr-1 appearance-none [field-sizing:content] bg-transparent outline-none"
              onChange={(event) => setViewYear(Number(event.target.value))}
              value={viewYear}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}년
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="report-month">
              월
            </label>
            <select
              id="report-month"
              className="appearance-none [field-sizing:content] bg-transparent outline-none"
              onChange={(event) => setViewMonth(Number(event.target.value))}
              value={viewMonth}
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                <option key={month} value={month}>
                  {month}월
                </option>
              ))}
            </select>
            <button
              aria-label="달력 접기"
              className="flex items-center"
              onClick={() => setIsExpanded(false)}
              type="button"
            >
              <MdArrowDropDown aria-hidden="true" className="size-6" />
            </button>
          </div>
        ) : (
          <button
            aria-expanded="false"
            aria-label={`${viewYear}년 ${viewMonth}월 달력 펼치기`}
            className="flex items-center text-[18px] font-bold text-text-main"
            onClick={() => setIsExpanded(true)}
            type="button"
          >
            <span>{viewYear}년 {viewMonth}월</span>
            <MdArrowDropUp aria-hidden="true" className="size-6" />
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mx-auto mt-3 grid w-[334px] max-w-full grid-cols-7 gap-x-[9px] text-center text-[10px] text-text-muted">
          {weekdays.map((weekday) => (
            <span key={weekday} className="leading-3">
              {weekday}
            </span>
          ))}
        </div>
      )}

      <div
        className={`mx-auto grid w-[334px] max-w-full grid-cols-7 gap-x-[9px] ${
          isExpanded ? 'mt-[9px] gap-y-[9px]' : 'mt-2'
        }`}
      >
        {days.map((day, index) => {
          const isSelected = day.id === selectedDate;
          const status = statusClassNames[day.status];

          return (
            <button
              key={day.id}
              aria-label={`${day.month}월 ${day.date}일${isSelected ? ', 선택됨' : ''}`}
              aria-pressed={isSelected}
              className="flex min-w-0 flex-col items-center text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => handleDateSelect(day)}
              type="button"
            >
              {!isExpanded && <span className="text-[10px] leading-4">{weekdays[index]}</span>}
              <span
                className={`text-[10px] leading-[18px] ${day.isToday ? 'font-bold' : 'font-normal'} ${
                  isExpanded && !day.isCurrentMonth ? 'opacity-55' : ''
                }`}
              >
                {day.date}
              </span>
              <span
                aria-hidden="true"
                className={`size-6 rounded-full ${status.background} ${
                  isSelected ? 'border-2 border-text-main' : `border ${status.border}`
                }`}
              />
            </button>
          );
        })}
      </div>

      <div aria-hidden="true" className="-mx-[17px] mt-5 border-t border-text-muted" />

      <div className="mt-5 rounded-xl border border-primary-soft bg-surface px-5 py-[18px]">
        <p className="text-[12px] font-semibold text-text-muted">
          🔥 현재 {currentStreak}일 연속 · 최고 {bestStreak}일
        </p>
      </div>
    </section>
  );
};

export default ReportCalendar;
