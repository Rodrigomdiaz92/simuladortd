import { appController } from "../appController";

customElements.define(
  "dhs-progress-bar",
  class ProgressBar extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.intervalId = setInterval(() => {
        if (
          appController.app &&
          typeof appController.app.itemsToComplete !== "undefined"
        ) {
          this._levels = appController.app.itemsToComplete;
          this.value = appController.userSettings.settings.currentProgress || 0;
          this._currentLevel =
            appController.userSettings.settings.currentLevel || 0;
          this.render();
          this.updateProgressBar();
          clearInterval(this.intervalId);
        }
      }, 100); // Verifica cada 100ms
    }

    set progress(value) {
      this.value = value;
      this.updateProgressBar();
    }

    updateProgressBar() {
      const roundedPercentage = Math.trunc(this.value);
      this.progressBar.style.width = `${roundedPercentage}%`;
      this.progressBar.textContent = `${roundedPercentage}%`;
      this.progressText.textContent = `${this._currentLevel}/${this._levels}`;
      if (
        this.value === 100 &&
        !this.progressBar.classList.contains("complete")
      ) {
        this.progressBar.classList.add("complete");
      } else if (
        this.value !== 100 &&
        this.progressBar.classList.contains("complete")
      ) {
        this.progressBar.classList.remove("complete");
      }
      appController.userSettings.settings.currentProgress = this.value;
      appController.userSettings.settings.currentLevel = this._currentLevel;
    }

    aumentar() {
      if (this._currentLevel < this._levels) {
        this._currentLevel++;
        this.progress = (this._currentLevel / this._levels) * 100;
      }
    }

    disminuir() {
      if (this._currentLevel > 0) {
        this._currentLevel--;
        this.progress = (this._currentLevel / this._levels) * 100;
      }
    }

    connectedCallback() {
      document.addEventListener("aumentar-progress", () => {
        this.aumentar();
      });
      document.addEventListener("disminuir-progress", () => {
        this.disminuir();
      });
    }

    disconnectedCallback() {
      document.removeEventListener("aumentar-progress", this.aumentar);
      document.removeEventListener("disminuir-progress", this.disminuir);
    }
    render() {
      this.shadowRoot.innerHTML = `
          <style>
            .container {
              width: 200px;
              background-color: #e0e0e0;
              border-radius: 5px;
              overflow: hidden;
              margin-top: 10px;
            }
            .bar {
              height: 100%;
              width: 0%;
              background-color: #76c7c0;
              text-align: center;
              line-height: 20px; /* Match the height of the bar */
              color: white;
              border-radius: 5px;
            }
            .bar.complete{
              background-color:rgb(76, 175, 80);
            }
            .progress-container{
              display:flex;
              align-items:flex-end;
              gap:5px;
            }
            #progress-text{
              margin:0;
            }
          </style>
          <div class="progress-container">
            <div class="container">
            <div class="bar">0%</div>
            </div>
            <p id="progress-text">${this._currentLevel}/${this._levels}</p>
          </div>
        `;

      this.progressBar = this.shadowRoot.querySelector(".bar");
      this.progressText = this.shadowRoot.querySelector("#progress-text");
    }
  }
);
