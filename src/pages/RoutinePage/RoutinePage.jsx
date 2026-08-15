import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoutineActionSheet from "./components/RoutineActionSheet";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import RoutineList from "./components/RoutineList";
import RoutineToast from "./components/RoutineToast";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const dayToApiDay = {
  월: "MON",
  화: "TUE",
  수: "WED",
  목: "THU",
  금: "FRI",
  토: "SAT",
  일: "SUN",
};

const apiDayToDay = Object.fromEntries(
  Object.entries(dayToApiDay).map(([day, apiDay]) => [apiDay, day]),
);

const toRoutine = (routine) => ({
  id: routine.id,
  name: routine.title,
  repeatType:
    routine.repeatType === "DAILY"
      ? "daily"
      : routine.repeatType === "COUNT"
        ? "count"
        : "days",
  days: routine.repeatDays
    ? routine.repeatDays
        .split(",")
        .map((day) => apiDayToDay[day])
        .filter(Boolean)
    : [],
  time: routine.performTime?.slice(0, 5) ?? "",
  startDate: routine.startDate ?? "",
  endDate: routine.endDate ?? "",
  notificationEnabled: routine.alarm,
  notificationTiming: routine.alarmTime ?? "정시",
  active: routine.active,
});

const RoutinePage = () => {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState([]);
  const [selectedDay, setSelectedDay] = useState("전체");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [actionRoutineId, setActionRoutineId] = useState(null);
  const [deleteRoutineId, setDeleteRoutineId] = useState(null);
  const [deletedRoutine, setDeletedRoutine] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  const fetchRoutines = useCallback(async (day, showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
      setFetchError("");
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${BASE_URL}/api/v1/routinefit/routines`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: day ? { day } : undefined,
        },
      );

      setRoutines(
        Array.isArray(response.data.data)
          ? response.data.data.map(toRoutine)
          : [],
      );
    } catch (error) {
      setRoutines([]);
      setFetchError(
        error.response?.status === 401
          ? "로그인이 만료되었거나 유효하지 않습니다."
          : "루틴을 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- API response updates state asynchronously.
    fetchRoutines(undefined, false);
  }, [fetchRoutines]);

  const actionRoutine =
    routines.find((routine) => routine.id === actionRoutineId) ?? null;
  const deleteRoutine =
    routines.find((routine) => routine.id === deleteRoutineId) ?? null;
  const sortedRoutines = useMemo(
    () =>
      routines.toSorted((first, second) =>
        first.time.localeCompare(second.time),
      ),
    [routines],
  );

  useEffect(() => {
    if (!toastVisible) return undefined;
    const timeoutId = window.setTimeout(() => setToastVisible(false), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [toastVisible]);

  const handleOpenCreate = () => navigate("/routines/new");
  const handleOpenDetail = (routineId) => navigate(`/routines/${routineId}`);
  const handleOpenEdit = (routineId) => {
    setActionRoutineId(null);
    navigate(`/routines/${routineId}/edit`);
  };
  const handleSelectDay = (day) => {
    setSelectedDay(day);
    fetchRoutines(dayToApiDay[day]);
  };
  const handleToggleRoutine = (routineId) =>
    setRoutines((items) =>
      items.map((routine) =>
        routine.id === routineId
          ? { ...routine, active: !routine.active }
          : routine,
      ),
    );

  const handleRequestDelete = (routineId) => {
    setActionRoutineId(null);
    setDeleteRoutineId(routineId);
  };

  const handleConfirmDelete = () => {
    const routineId = deleteRoutineId;
    const index = routines.findIndex((routine) => routine.id === routineId);
    const routine = routines[index];
    if (!routine) return;
    setDeletedRoutine({ index, routine });
    setRoutines((items) => items.filter((item) => item.id !== routineId));
    setActionRoutineId(null);
    setDeleteRoutineId(null);
    setToastVisible(true);
  };

  const handlePauseInstead = () => {
    if (deleteRoutineId) {
      handleToggleRoutine(deleteRoutineId);
    }
    setDeleteRoutineId(null);
  };

  const handleUndoDelete = () => {
    if (!deletedRoutine) return;
    setRoutines((items) => {
      const restored = [...items];
      restored.splice(deletedRoutine.index, 0, deletedRoutine.routine);
      return restored;
    });
    setDeletedRoutine(null);
    setToastVisible(false);
  };

  if (isLoading || fetchError) {
    return (
      <section className="flex min-h-[792px] w-[402px] items-center justify-center bg-background px-[17px] text-center text-text-muted">
        {isLoading ? "루틴을 불러오는 중입니다..." : fetchError}
      </section>
    );
  }

  return (
    <>
      <RoutineList
        onOpenActions={setActionRoutineId}
        onOpenCreate={handleOpenCreate}
        onSelectDay={handleSelectDay}
        onSelectRoutine={handleOpenDetail}
        onToggleRoutine={handleToggleRoutine}
        routines={sortedRoutines}
        selectedDay={selectedDay}
      />
      <RoutineActionSheet
        onClose={() => setActionRoutineId(null)}
        onDelete={handleRequestDelete}
        onEdit={handleOpenEdit}
        onToggleActive={handleToggleRoutine}
        routine={actionRoutine}
      />
      <DeleteConfirmDialog
        onCancel={() => setDeleteRoutineId(null)}
        onConfirm={handleConfirmDelete}
        onPause={handlePauseInstead}
        routine={deleteRoutine}
      />
      <RoutineToast onUndo={handleUndoDelete} visible={toastVisible} />
    </>
  );
};

export default RoutinePage;
