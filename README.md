# LIFE / IN MOTION ⏳

> **An experimental digital instrument, interactive typography, and chronological new tab experience for Firefox & Chromium.**

Inspired by the philosophical premise that time is continuously passing, and perceiving its velocity changes how you experience your life. Not a dashboard. Not a generic age calculator. An astronomical, contemplative perspective on the micro-present and the macro scale of an entire human lifespan.

---

## ⚡ Core Philosophy & Features

* **Continuous "Life Zoom"**: Use your mouse scroll wheel or tactile scrubber to scale smoothly across dimensions:
  $$\text{LIFE (80-year macro)} \longleftrightarrow \text{YEARS} \longleftrightarrow \text{MONTHS} \longleftrightarrow \text{DAYS} \longleftrightarrow \text{HOURS} \longleftrightarrow \text{NOW (Microsecond precision)}$$
* **Three Generative Canvas Modes (Locked 60 FPS)**:
  * **`01 FIELD`**: An astronomical matrix of 52 columns (weeks per year) across your expected lifespan. Lived weeks appear as luminous graphite points; future weeks remain faint celestial coordinates; pinned memories glow as ruby beacons; the active present week pulses with real-time harmonic seconds.
  * **`02 RIBBON`**: A continuous timeline vector where elapsed duration forms a dense filament with harmonic wave oscillation, and the future trajectory unspools ahead.
  * **`03 ORBIT`**: Concentric Keplerian celestial cycles (Day, Year, Life) revolving with astronomical precision and cardinal markers.
* **Precision Temporal Engine**:
  * Calculates age down to **8 decimal places** updated continuously at **60 FPS** using the tropical year constant (`365.242199` days/year).
  * System-derived micro-clock with moving milliseconds (`HH:MM:SS.mmm`) and zero-jitter tabular figures.
* **Streamlined Calibration Onboarding**:
  * Clean, minimalistic split-view onboarding with live telemetry feedback (elapsed years, days lived, weeks remaining, life percentage).
* **Unified Settings & Memories Drawer**:
  * Slide-over control center with segmented tabs for Calibration, Private Memories, and Display & Shortcuts.
* **Click-to-Pin Memory Annotations**:
  * Click any week on the Field canvas or timeline vector to record personal milestone moments stored 100% offline.
* **Finite (Zen) Mode**:
  * Press **`F`** or click **`FINITE`** to strip away all chrome and labels, leaving only pure life percentage and living visual geometry.
* **100% Offline & Private**:
  * Zero analytics, zero trackers, zero external fonts or CDNs. Your data never leaves your device.

---

## 🚀 Installation & Testing

### Mozilla Firefox
1. Navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**.
3. Select `manifest.json` in this directory.
4. Open a new tab (`Ctrl + T`).

### Google Chrome / Brave / Edge
1. Navigate to `chrome://extensions`.
2. Enable **Developer Mode** (top-right toggle).
3. Click **Load unpacked** and select this directory.
4. Open a new tab (`Ctrl + T`).

---

## ⌨️ Shortcuts & Interactions

| Action | Control |
| :--- | :--- |
| **Life Zoom** | Scroll mouse wheel / `+` / `-` / Click scale labels |
| **Switch Visual Mode** | Press `1` (Field), `2` (Ribbon), `3` (Orbit) |
| **Toggle Finite Mode** | Press `F` or click `FINITE` |
| **Hover Inspection** | Move cursor over canvas points |
| **Pin Memory to Date** | Click any week point on canvas / Press `M` |
| **Open Settings** | Press `S` or click `SETTINGS` |
| **Close Overlay** | Press `Esc` |

---

## 📄 License
MIT License

