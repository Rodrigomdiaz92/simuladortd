import { pgEvent } from "../../utils/pgEvent";
import { crearHojaGrafico, crearHojaTabla } from "../../utils/sheet";

customElements.define(
  "insert-menu",
  class HeaderElement extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.render();
    }
    addListeners() {
      //Abrir el menu
      const menuButton = this.querySelector("#menu");
      const contenido = this.querySelector(".contenido-menu");
      menuButton.addEventListener("click", () => {
        if (contenido.style.display == "none") {
          contenido.style.display = "block";
          return;
        }
        contenido.style.display = "none";
      });
      //Cerrar ante cualquier click fuera
      document.addEventListener("click", (event) => {
        const isClickInsideMenu =
          menuButton.contains(event.target) || contenido.contains(event.target);
        if (!isClickInsideMenu) {
          contenido.style.display = "none"; // Ocultar el menú si se hace clic fuera de él
        }
      });

      const buttonTabla = document.getElementById("crear-tabla-dinamica");
      const buttonGrafico = document.getElementById("crear-grafico-button");

      buttonTabla.addEventListener("click", (e) => {
        // Obtener la instancia de DataTableView
        const dataTableView = window.dataTableView;

        // Aquí puedes usar dataTableView
        // Por ejemplo, puedes llamar a getSelectedRange()
        const selectedRange = dataTableView.getSelectedRange();

        // Verificar si la selección cumple con los requisitos
        const rowRequirementNotMet =
          selectedRange.endRowIndex - selectedRange.startRowIndex + 1 <
          dataTableView.minRows;
        const columnRequirementNotMet =
          selectedRange.endColIndex - selectedRange.startColIndex + 1 <
          dataTableView.minCols;

        if (rowRequirementNotMet || columnRequirementNotMet) {
          let errorMessage = "La selección debe tener al menos ";

          if (rowRequirementNotMet && columnRequirementNotMet) {
            errorMessage += `${dataTableView.minRows} filas y ${dataTableView.minCols} columnas.`;
          } else if (rowRequirementNotMet) {
            errorMessage += `${dataTableView.minRows} filas.`;
          } else {
            errorMessage += `${dataTableView.minCols} columnas.`;
          }

          // Hacer que Andy "diga" el mensaje de error
          window.tabEl.handleChat(errorMessage, "error");

          // Enviar mensaje de error a Playground
          // pgEvent.onFailEvent(errorMessage, []);
          //pgEvent.postEvent("FAILURE", null, [], null);


          return;
        }
        e.stopImmediatePropagation();
        crearHojaTabla();
      });

      buttonGrafico.addEventListener("click", (e) => {
        e.stopImmediatePropagation();
        crearHojaGrafico();
      });
    }

    render() {
      this.innerHTML = `
        <div id="menu">
        <button>
          <p>Insertar</p>
        </button>
        <div class="contenido-menu">
            <button disabled>Celdas</button>
            <button disabled>Filas</button>
            <button disabled>Columnas</button>
            <button disabled>Hoja</button>
            <button id="crear-grafico-button">Gráfico</button>
            <button id="crear-tabla-dinamica">Tabla dinámica</button>
        </div>
    </div>
    `;
      this.addListeners();
    }
  }
);
