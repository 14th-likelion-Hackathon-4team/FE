const RoutineToast = ({ visible, onUndo }) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-[98px] left-1/2 z-[55] flex h-[50px] w-[368px] -translate-x-1/2 items-center justify-between rounded-xl bg-text-main px-4 text-[14px] text-surface" role="status">
      <span>루틴을 삭제했어요</span>
      <button className="font-bold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" onClick={onUndo} type="button">되돌리기</button>
    </div>
  );
};

export default RoutineToast;
