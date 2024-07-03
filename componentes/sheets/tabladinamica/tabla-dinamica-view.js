import { DataTable } from "../../../clases/DataTable";
import { DataTableController } from "../../../clases/DataTableController";
import { PivotTable } from "../../../clases/PivotTable";
import { PivotTablePreview } from "../../../clases/PivotTablePreview";
import { state } from "../../../state";
import { transformData, buildPreview } from "../../../utils/pivot-table";
// Default SortableJS
// import { groupBy, sum, map, isFunction, uniq, filter, flatMap } from "lodash";
customElements.define(
  "tabla-dinamica-view",
  class HeaderElement extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.render();
    }
    addListeners() {
      //   const newDf = new dfd.DataFrame(state.seleccion.datos);
      const emptyDf = new dfd.DataFrame({
        "-": ["Filas", "", "", "", "", "", ""],
        Columnas: [
          "Valores",
          "Valores",
          "Valores",
          "Valores",
          "Valores",
          "Valores",
          "Valores",
        ],
        "--": ["", "", "", "", "", "", ""],
      });
      const dataTable = new DataTable(emptyDf);
      let initialConfig = {
        filas: ["-"],
        columnas: ["Columnas"],
        valores: ["--"],
        funcion: "sum",
      };
      const dataTableView = new PivotTable("table-container", initialConfig);
      const dataTableController = new DataTableController(
        dataTable,
        dataTableView
      );
      dataTableController.updateView();
      state.subscribe(() => {
        const { filas, columnas, valores, funcion } = state.seleccionTablaDinamica;
        let pivot;
        if (valores.length) {
          pivot = transformData(state.seleccion.datos, filas, columnas, valores);
          if (pivot === null) {
            return;
          } else {
            const newDataTable = new DataTable(pivot.tabla);
            dataTableController.view = new PivotTable("table-container", state.seleccionTablaDinamica);
            dataTableController.model = newDataTable;
            dataTableController.updateView();
          }
          return;
        }
        pivot = buildPreview(state.seleccion.datos);
        const newDataTable = new DataTable(pivot.tabla);
        dataTableController.view = new PivotTablePreview("table-container", state.seleccionTablaDinamica);
        dataTableController.model = newDataTable;
        dataTableController.updateView();
      });
    }

    render() {
      this.innerHTML = `
      <div class="insert-view table">
        <div class="view-container" id="table-container">
        </div>
      </div>
            `;
      const style = document.createElement("style");
      style.innerHTML = `
      .insert-view.table{
        align-items:flex-start;
        width:100%;
      }
   
      .grafico-preview{
        height:60%;
      }
      .view-container{
        overflow:auto;
        display:flex;
        width:100%;
        height:auto;
      }
      .view-container > h3{
        margin-top: 15%;
      }
      .insert-view.table  table{
        width:unset;
      }
              `;
      this.appendChild(style);
      this.addListeners();
    }
  }
);
