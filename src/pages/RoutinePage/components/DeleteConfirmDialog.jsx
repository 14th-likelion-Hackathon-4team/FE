import { useEffect } from "react";

const DeleteConfirmDialog = ({ routine, onCancel, onConfirm, onPause }) => {
  useEffect(() => {
    if (!routine) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCancel();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, routine]);

  if (!routine) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-text-main/20"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onCancel();
      }}
      role="dialog"
    >
      <section
        aria-labelledby="delete-dialog-title"
        className="min-h-[196px] w-[370px] rounded-[20px] border border-primary-soft bg-surface px-[17px] pt-[22px] pb-[18px] text-center"
      >
        <h2
          className="text-[18px] font-bold text-danger"
          id="delete-dialog-title"
        >
          루틴을 삭제할까요?
        </h2>
        <p className="mt-2 text-[13px] font-medium leading-[21px] text-text-main">
          지난 수행 기록도 함께 사라져요.
          <br />
          잠시 쉬고 싶다면 일시중지를 권해요.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-[18px]">
          <button
            className="h-11 rounded-xl border border-primary-soft bg-surface text-[15px] font-semibold text-text-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onCancel}
            type="button"
          >
            취소
          </button>
          <button
            className="h-11 rounded-xl border border-primary-soft bg-primary text-[15px] font-bold text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onConfirm}
            type="button"
          >
            삭제
          </button>
        </div>
        <button
          className="mt-2 text-[12px] text-text-muted underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={onPause}
          type="button"
        >
          대신 일시중지하기
        </button>
      </section>
    </div>
  );
};

export default DeleteConfirmDialog;
