// handles 100% local persistence - zero data ever leaves the device
const STORAGE_KEYS = {
  BIRTH: "life_in_motion_birth_timestamp",
  LIFESPAN: "life_in_motion_expected_lifespan",
  MODE: "life_in_motion_visual_mode",
  FINITE: "life_in_motion_finite_mode",
  MEMORIES: "life_in_motion_memories",
  SCALE: "life_in_motion_scale"
};

export const Storage = {
  getBirthTimestamp() {
    const raw = localStorage.getItem(STORAGE_KEYS.BIRTH);
    return raw ? parseInt(raw, 10) : null;
  },

  setBirthTimestamp(ts) {
    if (ts) {
      localStorage.setItem(STORAGE_KEYS.BIRTH, ts.toString());
    } else {
      localStorage.removeItem(STORAGE_KEYS.BIRTH);
    }
  },

  getExpectedLifespan() {
    const raw = localStorage.getItem(STORAGE_KEYS.LIFESPAN);
    return raw ? parseInt(raw, 10) : 80;
  },

  setExpectedLifespan(years) {
    localStorage.setItem(STORAGE_KEYS.LIFESPAN, years.toString());
  },

  getVisualMode() {
    return localStorage.getItem(STORAGE_KEYS.MODE) || "field";
  },

  setVisualMode(mode) {
    localStorage.setItem(STORAGE_KEYS.MODE, mode);
  },

  getFiniteMode() {
    return localStorage.getItem(STORAGE_KEYS.FINITE) === "true";
  },

  setFiniteMode(isActive) {
    localStorage.setItem(STORAGE_KEYS.FINITE, isActive ? "true" : "false");
  },

  getMemories() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MEMORIES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveMemories(list) {
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(list));
  },

  addMemory(timestamp, label) {
    const list = this.getMemories();
    const date = new Date(timestamp);
    const item = {
      id: "mem_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      timestamp,
      dateStr: date.toISOString().split("T")[0],
      year: date.getFullYear(),
      label: label.trim()
    };
    list.push(item);
    this.saveMemories(list);
    return item;
  },

  removeMemory(id) {
    const list = this.getMemories().filter((m) => m.id !== id);
    this.saveMemories(list);
  },

  clearAll() {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  }
};
