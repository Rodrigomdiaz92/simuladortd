import { pgEvent } from "../../utils/pgEvent";
import { state } from "../../state";
import { appController } from "../../appController";
import { set } from "lodash";

const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 30;
const ALERT_THRESHOLD = 15;

const COLOR_CODES = {
  info: {
    color: "green"
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD
  }
};

customElements.define(
  "timer-menu",
  class TimerElement extends HTMLElement {
    constructor() {
      super();
      this.timer = null;
      this.timeLeft = 60;
      this.timePassed = 0;
      this.remainingPathColor = COLOR_CODES.info.color;
    }

    connectedCallback() {
      this.render();

      window.addEventListener('stateChanged', (event) => {
        const state = event.detail;

        if (state.timer) {
          if (state.ejercicioCompletado) {
            this.stopTimer();
          } else {
            this.startTimer();
          }
        } else {
          this.stopTimer();
        }
      });
    }

    startTimer() {
      // this.stopTimer();
      clearInterval(this.timer);
      this.timer = null;
      this.timeLeft = 60;
      this.timePassed = 0;
      this.remainingPathColor = COLOR_CODES.info.color;
      this.updateTimerDisplay();
      this.timer = setInterval(() => {
        this.timePassed++;
        this.timeLeft = 60 - this.timePassed;
        this.updateTimerDisplay();

        if (this.timeLeft <= 0) {
          this.stopTimer();
          state.timer = false;
          appController.userSettings.save();
        }
      }, 1000);
      this.querySelector('.base-timer').classList.add('visible');
    }

    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
        this.timeLeft = 60;
        this.timePassed = 0;
        this.updateTimerDisplay();
        
        
        setTimeout(() => {
          this.querySelector('.base-timer').classList.remove('visible');
        }, 1400);
      
      }
    }

    updateTimerDisplay() {
      const label = this.querySelector("#base-timer-label");
      const pathRemaining = this.querySelector("#base-timer-path-remaining");
      label.innerHTML = this.formatTime(this.timeLeft);
      this.setCircleDasharray(pathRemaining);
      this.setRemainingPathColor(pathRemaining, this.timeLeft);
    }

    formatTime(time) {
      return time;
    }

    // formatTime(time) {
    //   const minutes = Math.floor(time / 60);
    //   let seconds = time % 60;

    //   if (seconds < 10) {
    //     seconds = `0${seconds}`;
    //   }

    //   return `${minutes}:${seconds}`;
    // }

    setRemainingPathColor(pathRemaining, timeLeft) {
      const { alert, warning, info } = COLOR_CODES;

      if (timeLeft <= alert.threshold) {
        pathRemaining.classList.remove(warning.color);
        pathRemaining.classList.add(alert.color);
      } else if (timeLeft <= warning.threshold) {
        pathRemaining.classList.remove(info.color);
        pathRemaining.classList.add(warning.color);
      } else {
        pathRemaining.classList.remove(alert.color);
        pathRemaining.classList.remove(warning.color);
        pathRemaining.classList.add(info.color);
      }
    }

    calculateTimeFraction() {
      const rawTimeFraction = this.timeLeft / 140; // Cambio el divisor a 140
      return rawTimeFraction - (1 / 140) * (1 - rawTimeFraction); // Cambio el divisor a 140
    }

    setCircleDasharray(pathRemaining) {
      const circleDasharray = `${(this.calculateTimeFraction() * FULL_DASH_ARRAY).toFixed(0)} 283`;
      pathRemaining.setAttribute("stroke-dasharray", circleDasharray);
    }

    render() {
      this.innerHTML = `
        <style>
          body {
            font-family: sans-serif;
            display: grid;
            height: 100vh;
            place-items: center;
          }
          .base-timer {
            position: absolute;
            width: 100px;
            height: 100px;
            top: -5px;
            right: 45px;
            opacity: 0;
            transition: opacity 0.5s ease;
          }
          .base-timer.visible {
            opacity: 1;
          }
          .base-timer__svg {
            transform: scaleX(-1);
          }
          .base-timer__circle {
            fill: none;
            stroke: none;
          }
          .base-timer__path-elapsed {
            stroke-width: 5px;
            stroke: grey;
          }
          .base-timer__path-remaining {
            stroke-width: 5px;
            stroke-linecap: round;
            transform: rotate(90deg);
            transform-origin: center;
            transition: 1s linear all;
            fill-rule: nonzero;
            stroke: currentColor;
          }
          .base-timer__path-remaining.green {
            color: rgb(65, 184, 131);
          }
          .base-timer__path-remaining.orange {
            color: orange;
          }
          .base-timer__path-remaining.red {
            color: red;
          }
          .base-timer__label {
            position: absolute;
            width: 100px;
            height: 100px;
            top: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
          }

          .base-timer__status {
            position: absolute;
            left: -85px; /* Ajusta la posición según tus necesidades */
            top: 42px;
            font-size: 14px; /* Ajusta el tamaño de fuente según tus necesidades */
            color: #333; /* Ajusta el color según tus necesidades */
          }
          
          </style>
          <div class="base-timer">
            <span class="base-timer__status">Guardando en:</span>
            <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <g class="base-timer__circle">
                <circle class="base-timer__path-elapsed" cx="50" cy="50" r="20"></circle>
                <path
                  id="base-timer-path-remaining"
                  stroke-dasharray="283"
                  class="base-timer__path-remaining ${this.remainingPathColor}"
                  d="
                    M 50, 50
                    m -20, 0
                    a 20,20 0 1,0 40,0
                    a 20,20 0 1,0 -40,0
                  "
                ></path>
              </g>
            </svg>
            <span id="base-timer-label" class="base-timer__label">${this.formatTime(this.timeLeft)}</span>
          </div>
        `;
    }
  }
);
