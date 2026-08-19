import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoutineActionSheet from "./components/RoutineActionSheet";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import RoutineList from "./components/RoutineList";

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
  repeatCount: routine.repeatCount ?? 0,
  time: routine.performTime?.slice(0, 5) ?? "",
  startDate: routine.startDate ?? "",
  endDate: routine.endDate ?? "",
  notificationEnabled: routine.alarm,
  notificationTiming: routine.alarmTime ?? "정시",
  active: routine.active,
});

const getStatusErrorMessage = (error) => {
  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;

  if (status === 401) return "로그인이 만료되었거나 유효하지 않습니다.";
  if (status === 403) return "이 루틴의 상태를 변경할 권한이 없습니다.";
  if (status === 404) return "존재하지 않거나 삭제된 루틴입니다.";
  return serverMessage || "루틴 상태를 변경하지 못했습니다.";
};

const getDeleteErrorMessage = (error) => {
  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;

  if (status === 401) return "로그인이 만료되었습니다. 다시 로그인해주세요.";
  if (status === 403) return "이 루틴을 삭제할 권한이 없습니다.";
  if (status === 404) return "존재하지 않거나 이미 삭제된 루틴입니다.";
  return serverMessage || "루틴을 삭제하지 못했습니다.";
};

const RoutinePage = () => {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState([]);
  const [selectedDay, setSelectedDay] = useState("전체");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [actionRoutineId, setActionRoutineId] = useState(null);
  const [deleteRoutineId, setDeleteRoutineId] = useState(null);

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
  const handleToggleRoutine = async (routineId, active) => {
    const targetRoutine = routines.find((routine) => routine.id === routineId);
    if (!targetRoutine) return;

    const nextActive =
      typeof active === "boolean" ? active : !targetRoutine.active;
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      window.alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      const response = await axios.patch(
        `${BASE_URL}/api/v1/routinefit/routines/${routineId}/status`,
        { active: nextActive },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      const updatedActive = response.data?.data?.active;

      setRoutines((items) =>
        items.map((routine) =>
          routine.id === routineId
            ? {
                ...routine,
                active:
                  typeof updatedActive === "boolean"
                    ? updatedActive
                    : nextActive,
              }
            : routine,
        ),
      );
    } catch (error) {
      window.alert(getStatusErrorMessage(error));
    }
  };

  const handleRequestDelete = (routineId) => {
    setActionRoutineId(null);
    setDeleteRoutineId(routineId);
  };

  const handleConfirmDelete = async () => {
    const routineId = deleteRoutineId;
    if (!routineId) return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      window.alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      await axios.delete(
        `${BASE_URL}/api/v1/routinefit/routines/${routineId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      setRoutines((items) => items.filter((item) => item.id !== routineId));
      setActionRoutineId(null);
      setDeleteRoutineId(null);
    } catch (error) {
      window.alert(getDeleteErrorMessage(error));
    }
  };

  const handlePauseInstead = () => {
    if (deleteRoutineId) {
      handleToggleRoutine(deleteRoutineId, false);
    }
    setDeleteRoutineId(null);
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
    </>
  );
};

export default RoutinePage;
