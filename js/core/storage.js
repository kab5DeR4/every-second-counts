// handles 100% local persistence - zero data ever leaves the device
const STORAGE_KEYS = {
  BIRTH: "life_in_motion_birth_timestamp",
  LIFESPAN: "life_in_motion_expected_lifespan"
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
  }
};
