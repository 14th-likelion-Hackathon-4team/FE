const STORAGE_KEY = 'routinefit:daily-routine-update';

const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const readRoutineUpdate = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.date !== getLocalDate()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return stored.update ?? null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const saveRoutineUpdate = (update) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getLocalDate(), update }));
};
