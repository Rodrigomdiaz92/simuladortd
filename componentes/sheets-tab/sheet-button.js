import { unpaintAllButtons } from "../../utils/tab";
import { appController } from "../../appController";
import swal from "sweetalert";

customElements.define(
  "sheet-button",
  class PageButton extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.render();
    }
    addListeners() {
      // Usa 'this' para referenciar el botón actual
      this.querySelector("div").addEventListener("click", () => {
        // Quita clase 'selected' de todos los botones
        unpaintAllButtons();
        // Agrega la clase 'selected' al botón actual
        const button = this.querySelector(".sheet-button");
        button.classList.add("selected");

        // Oculta todas las pestañas
        let tabs = document.querySelectorAll(".content-container");
        tabs.forEach((tab) => tab.classList.remove("selected"));

        // Muestra la pestaña seleccionada
        const numeroDeId = this.id.replace("button", "");
        let selectedTab = document.getElementById(
          "content-container" + numeroDeId
        );
        if (selectedTab) {
          selectedTab.classList.add("selected");
        }
      });
      this.querySelector("button").addEventListener("click", (e) => {
        e.stopPropagation();
        const numeroDeId = this.id.replace("button", "");
        if (numeroDeId > 1) {
          swal({
            title: "Aviso",
            text: "¿Seguro que quieres eliminar esta hoja?",
            buttons: ["Cancelar", "Aceptar"],
            dangerMode: true,
          }).then((willDelete) => {
            if (willDelete) {
              let sheetsContainer = document.querySelector(".sheets-container");
              let selectedSheet = sheetsContainer.querySelector(
                `sheet-el:nth-child(${numeroDeId})`
              );
              this.dispatchEvent(
                new CustomEvent("tab-deleted", {
                  detail: {
                    numeroDeId: numeroDeId,
                  },
                  bubbles: true,
                })
              );
              selectedSheet.remove();
              this.remove();
              appController.userSettings.reset();

              // // Obtén el div dentro del botón correspondiente a la hoja de datos
              // const dataSheetButtonDiv = document.querySelector('sheet-button[id="button1"] div');

              // // Si el div existe, simula un clic en él
              // if (dataSheetButtonDiv) {
              //   dataSheetButtonDiv.click();
              // }
            }
          });
        }
      });
      this.addEventListener("mouseover", () => {
        const button = this.querySelector("button");
        button.classList.remove("disabled");
      });
      this.addEventListener("mouseout", () => {
        const button = this.querySelector("button");
        button.classList.add("disabled");
      });
    }

    render() {
      this.innerHTML = `
        <div id=${this.id} class="sheet-button ${this.className}">${this.textContent}
        <button class="cancel-button disabled">X</button>
        </div>
      `;
      const style = document.createElement("style");
      style.innerHTML = `
      div#button1 button{
        display:none;
      }
      div[id^="button"] {
          display:inline-block;
          height: 42px;
          color: #444746;
          font-size:14px;
          font-weight: 600;
          place-content:center;
          padding:0 11px;
          cursor: pointer;
        }
        div[id^="button"]:hover{
          background-color:#e8ebee;
        }
        div[id^="button"].selected{
          color:#0b57d0;
          background-color:#e1e9f7;
        }
        .sheet-button .cancel-button{
          cursor:pointer;
          display:inline-block;
          background-color:transparent;
          border: none;
        }
        .cancel-button.disabled{
          display:none;
        }  

      `;
      this.appendChild(style);
      this.addListeners();
    }
  }
);
