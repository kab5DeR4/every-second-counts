// smooth vertical rolling digits for precision numbers

export class OdometerDisplay {
  constructor(element) {
    this.element = element;
    this.currentVal = "";
    this.slots = [];
  }

  // update text with rolling digit animation
  set(val) {
    const str = String(val);
    if (str === this.currentVal) return;

    // re-create structure if layout changes or first time
    if (str.length !== this.slots.length || this.needsRebuild(str)) {
      this.rebuild(str);
    } else {
      this.updateSlots(str);
    }

    this.currentVal = str;
  }

  needsRebuild(newStr) {
    for (let i = 0; i < newStr.length; i++) {
      const isDigit = /\d/.test(newStr[i]);
      const slot = this.slots[i];
      if (!slot || slot.isDigit !== isDigit) return true;
    }
    return false;
  }

  rebuild(str) {
    this.element.innerHTML = "";
    this.slots = [];

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const isDigit = /\d/.test(ch);

      if (isDigit) {
        const slotEl = document.createElement("span");
        slotEl.className = "odometer-slot";

        const ribbon = document.createElement("span");
        ribbon.className = "odometer-ribbon";

        // stack digits 0 through 9
        for (let d = 0; d <= 9; d++) {
          const digitSpan = document.createElement("span");
          digitSpan.className = "odometer-num";
          digitSpan.textContent = d;
          ribbon.appendChild(digitSpan);
        }

        slotEl.appendChild(ribbon);
        this.element.appendChild(slotEl);

        const digitVal = parseInt(ch, 10);
        ribbon.style.transform = `translateY(-${digitVal * 10}%)`;

        this.slots.push({ isDigit: true, ribbon, current: digitVal });
      } else {
        const sep = document.createElement("span");
        sep.className = "odometer-sep";
        sep.textContent = ch;
        this.element.appendChild(sep);

        this.slots.push({ isDigit: false, element: sep, char: ch });
      }
    }
  }

  updateSlots(newStr) {
    for (let i = 0; i < newStr.length; i++) {
      const ch = newStr[i];
      const slot = this.slots[i];

      if (slot.isDigit) {
        const nextDigit = parseInt(ch, 10);
        if (slot.current !== nextDigit) {
          slot.current = nextDigit;
          slot.ribbon.style.transform = `translateY(-${nextDigit * 10}%)`;
        }
      } else if (slot.char !== ch) {
        slot.element.textContent = ch;
        slot.char = ch;
      }
    }
  }
}
