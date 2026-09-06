// memory layer: private local annotations across your life timeline
import { Storage } from "../core/storage.js";

export class MemoryUI {
  constructor(onMemoriesUpdated) {
    this.onUpdated = onMemoriesUpdated;

    // Drawer elements
    this.drawerForm = document.getElementById("drawer-memory-form");
    this.drawerDateInput = document.getElementById("drawer-mem-date");
    this.drawerLabelInput = document.getElementById("drawer-mem-label");
    this.drawerListContainer = document.getElementById("drawer-memory-list");
    this.drawerMemCount = document.getElementById("drawer-mem-count");

    // Quick-pin modal elements (from direct canvas click)
    this.quickPinModal = document.getElementById("quick-pin-modal");
    this.quickPinForm = document.getElementById("quick-pin-form");
    this.quickPinText = document.getElementById("quick-pin-text");
    this.quickPinDateLabel = document.getElementById("quick-pin-date-label");
    this.quickPinClose = document.getElementById("quick-pin-close");
    this.quickPinCancel = document.getElementById("quick-pin-cancel");

    this.pendingPinTimestamp = null;

    this.initEvents();
    this.renderList();
  }

  initEvents() {
    // 1. Drawer memory form submit
    if (this.drawerForm) {
      this.drawerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const rawDate = this.drawerDateInput.value;
        const label = this.drawerLabelInput.value;
        if (!rawDate || !label) return;

        const ts = new Date(rawDate).getTime();
        if (isNaN(ts)) return;

        Storage.addMemory(ts, label);
        this.drawerLabelInput.value = "";
        this.renderList();

        if (this.onUpdated) {
          this.onUpdated(Storage.getMemories());
        }
      });
    }

    // 2. Quick-pin modal submit
    if (this.quickPinForm) {
      this.quickPinForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = this.quickPinText.value.trim();
        if (!text || !this.pendingPinTimestamp) return;

        Storage.addMemory(this.pendingPinTimestamp, text);
        this.closeQuickPin();
        this.renderList();

        if (this.onUpdated) {
          this.onUpdated(Storage.getMemories());
        }
      });
    }

    if (this.quickPinClose) {
      this.quickPinClose.addEventListener("click", () => this.closeQuickPin());
    }
    if (this.quickPinCancel) {
      this.quickPinCancel.addEventListener("click", () => this.closeQuickPin());
    }
  }

  renderList() {
    const list = Storage.getMemories();
    if (this.drawerMemCount) {
      this.drawerMemCount.textContent = list.length;
    }

    if (!this.drawerListContainer) return;
    this.drawerListContainer.innerHTML = "";

    if (list.length === 0) {
      this.drawerListContainer.innerHTML = `<div style="font-size:0.68rem;color:#555;padding:0.6rem;text-align:center;">No moments recorded yet. Click any week on the field or use the form above.</div>`;
      return;
    }

    // sort newest first
    const sorted = [...list].sort((a, b) => b.timestamp - a.timestamp);

    sorted.forEach((item) => {
      const row = document.createElement("div");
      row.className = "memory-item-row";

      const info = document.createElement("div");
      info.className = "memory-item-info";
      info.innerHTML = `<span class="memory-item-year">${item.year}</span> <span class="memory-item-text">${item.label}</span>`;

      const delBtn = document.createElement("button");
      delBtn.className = "memory-del-btn";
      delBtn.innerHTML = "&times;";
      delBtn.title = "Delete memory";
      delBtn.addEventListener("click", () => {
        Storage.removeMemory(item.id);
        this.renderList();
        if (this.onUpdated) {
          this.onUpdated(Storage.getMemories());
        }
      });

      row.appendChild(info);
      row.appendChild(delBtn);
      this.drawerListContainer.appendChild(row);
    });
  }

  openQuickPin(timestamp) {
    this.pendingPinTimestamp = timestamp;
    const d = new Date(timestamp);
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    this.quickPinDateLabel.textContent = `MOMENT: ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    this.quickPinText.value = "";
    this.quickPinModal.hidden = false;
    setTimeout(() => this.quickPinText.focus(), 50);
  }

  closeQuickPin() {
    this.quickPinModal.hidden = true;
    this.pendingPinTimestamp = null;
  }
}

