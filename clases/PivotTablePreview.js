import { difference, filter, flatten, intersection, isEqual } from "lodash";
import { state } from "../state";

import {
  generateCombinations,
  getParametrosTablaDinamica,
  defineTotalColLength,
  castSpanishOperation,
  getFirstHeader,
  cantidadSegunConfig,
} from "../utils/pivot-table";
import { PivotTable } from "./PivotTable";

export class PivotTablePreview extends PivotTable {
  constructor(id, seleccion) {
    super(id);
    this.seleccion = seleccion;
    this.spinner = document.getElementById("loading-spinner");
    this.timeout = 10000; // 10 seconds timeout
    this.previousTableHTML = ""; // To store the previous table state
  }

  async renderTable(dataTable) {
    this.showSpinner();
    this.dataTable = dataTable;
    this.previousTableHTML = this.container.innerHTML; // Store the previous table state
    this.table = document.createElement("table");
    const indexRow = this.table.insertRow();
    const headerRow = this.table.insertRow();
    const { filas, columnas, valores } = this.seleccion;
    let rowsCache = [];

    const { valuesPositionsInMatrix, uniqueColumns, uniqueRows, config } =
      getParametrosTablaDinamica(filas, [], columnas, this.dataTable);
    const cantidadFilasAgrupadas = filas.length;
    const cantidadColumnasAgrupadas = columnas.length;

    const firstHeader = getFirstHeader(columnas, [], filas);
    const totalColumnLength = defineTotalColLength(
      uniqueColumns,
      cantidadFilasAgrupadas,
      cantidadColumnasAgrupadas,
      []
    );

    let trueCantidad =
      firstHeader.length +
      cantidadSegunConfig(
        cantidadColumnasAgrupadas,
        cantidadFilasAgrupadas,
        [],
        totalColumnLength
      );
    this.crearLetrasIndice(indexRow, trueCantidad);

    const startTime = Date.now();

    if (columnas.length) {
      for (const [index, header] of firstHeader.entries()) {
        if (Date.now() - startTime > this.timeout) {
          this.handleTimeout();
          return;
        }

        let td;
        if (
          index === 0 &&
          valores.length === 0 &&
          cantidadColumnasAgrupadas === 1 &&
          cantidadFilasAgrupadas === 0
        ) {
          td = this.crearTd("");
        } else if (
          index === 0 &&
          valores.length > 1 &&
          cantidadColumnasAgrupadas >= 1
        ) {
          td = this.crearTd("");
        } else if (
          index === 0 &&
          cantidadFilasAgrupadas === 0 &&
          valores.length === 1
        ) {
          td = this.crearTd("");
        } else if (index === firstHeader.length - 1) {
          td = this.crearTd(header);
          td.colSpan =
            totalColumnLength +
            (cantidadFilasAgrupadas ? cantidadFilasAgrupadas - 1 : 0);
        } else {
          td = this.crearTd(header);
        }
        headerRow.appendChild(td);
      }
      rowsCache.push(headerRow);
    }

    const colSpanAmount = uniqueColumns.slice(1).reduce((acc, curr) => {
      acc *= curr.length;
      return acc;
    }, 1);

    for (const [colIndex, cols] of columnas.entries()) {
      if (Date.now() - startTime > this.timeout) {
        this.handleTimeout();
        return;
      }

      const columnNames = this.table.insertRow();
      if (colIndex === 0) {
        if (filas.length === 0) {
          let td = this.crearTd("");
          columnNames.appendChild(td);
        }
        filas.forEach((f) => {
          if (columnas.length > 1) {
            let td = this.crearTd("");
            columnNames.appendChild(td);
          } else {
            const cell = columnNames.insertCell();
            cell.className = "column-name";
            cell.textContent = f;
          }
        });
        uniqueColumns[0].forEach((c) => {
          let td = this.crearTd(c);
          td.colSpan = colSpanAmount;
          columnNames.appendChild(td);
        });
        rowsCache.push(columnNames);
        await this.sleep(0);
        continue;
      }
      if (filas.length === 0) {
        let td = this.crearTd("");
        columnNames.appendChild(td);
      }
      filas.forEach((f) => {
        const cell = columnNames.insertCell();
        cell.className = "column-name";
        cell.textContent = f;
      });
      uniqueColumns[0].forEach(() => {
        uniqueColumns[colIndex].forEach((c) => {
          let td = this.crearTd(c);
          td.colSpan = cantidadFilasAgrupadas === 0 ? "none" : valores.length;
          columnNames.appendChild(td);
        });
      });
      rowsCache.push(columnNames);
      await this.sleep(0);
    }

    if (!config.columns) {
      uniqueColumns.pop();
    }
    if (!config.rows) {
      uniqueRows.pop();
    }

    if (
      cantidadFilasAgrupadas > 1 ||
      (cantidadColumnasAgrupadas > 1 && cantidadFilasAgrupadas > 1)
    ) {
      const rowSpanAmount = uniqueRows.slice(1).reduce((acc, curr) => {
        acc *= curr.length;
        return acc;
      }, 1);
      const subRowsSpanAmount = uniqueRows.slice(filas.length - 1)[0].length;
      if (valores.length > 1) {
        uniqueColumns.pop();
      }
      let result = generateCombinations(
        Array.of(...uniqueRows, ...uniqueColumns)
      );
      let lastSubrow = "";
      let lastRow;
      let lastRowValue;
      for (const res of result) {
        if (Date.now() - startTime > this.timeout) {
          this.handleTimeout();
          return;
        }

        const subRow = res.slice(1, res.length - columnas.length);
        const isActualCombination = isEqual(
          intersection(lastSubrow, res),
          lastSubrow
        );
        const diff = difference(res, lastSubrow);
        const isActualMainKey = res.includes(lastRowValue);
        if (!isActualCombination) {
          let rowsNamesAndValues = this.table.insertRow();
          if (!isActualMainKey) {
            const cell = rowsNamesAndValues.insertCell(0);
            cell.textContent = res[0];
            cell.className = "column-name";
            cell.rowSpan = rowSpanAmount;
          }
          lastRowValue = res[0];
          lastRow = rowsNamesAndValues;
          if ((diff.length >= 4) & (filas.length > 2)) {
            let td = this.crearTd(diff[1]);
            td.rowSpan = subRowsSpanAmount;
            rowsNamesAndValues.appendChild(td);
          }
          if ((diff.length >= 3) & (filas.length === 1)) {
            let td = this.crearTd(diff[0]);
            td.rowSpan = subRowsSpanAmount;
            rowsNamesAndValues.appendChild(td);
          }
          let td = this.crearTd(subRow[subRow.length - 1]);
          rowsNamesAndValues.appendChild(td);
          rowsCache.push(rowsNamesAndValues);
        }
        lastSubrow = subRow;
        await this.sleep(0);
      }
    } else if (cantidadFilasAgrupadas === 0) {
      let result = generateCombinations(
        Array.of(...uniqueRows, ...uniqueColumns)
      );
      for (const val of valuesPositionsInMatrix) {
        if (Date.now() - startTime > this.timeout) {
          this.handleTimeout();
          return;
        }

        const newRow = this.table.insertRow();
        const rowName = this.crearTd(
          `${castSpanishOperation(val.function)} de ${val.valueName}`
        );
        newRow.appendChild(rowName);
        for (const res of result) {
          const target = flatten(
            filter(
              this.dataTable.data,
              (subarray) => intersection(subarray, res).length === res.length
            )
          );
          const cell = newRow.insertCell();
          cell.textContent = target ? target[val.position] : 0;
          await this.sleep(0);
        }
        rowsCache.push(newRow);
      }
    } else if (cantidadFilasAgrupadas > 0) {
      if (valores.length > 1) {
        uniqueColumns.pop();
      }
      let result = generateCombinations(
        Array.of(...uniqueRows, ...uniqueColumns)
      );
      let lastSubrow = "";
      let lastRow;
      let lastRowValue;
      for (const res of result) {
        if (Date.now() - startTime > this.timeout) {
          this.handleTimeout();
          return;
        }

        const isActualMainKey = res.includes(lastRowValue);
        if (!isActualMainKey) {
          let rowsNamesAndValues = this.table.insertRow();
          const cell = rowsNamesAndValues.insertCell(0);
          cell.textContent = res[0];
          cell.className = "column-name";
          lastRowValue = res[0];
          lastRow = rowsNamesAndValues;
          rowsCache.push(rowsNamesAndValues);
          lastSubrow = res;
        }
        const target = flatten(
          filter(
            this.dataTable.data,
            (subarray) => intersection(subarray, res).length === res.length
          )
        );
        for (const v of valuesPositionsInMatrix) {
          const cell = lastRow.insertCell();
          cell.textContent = target ? target[v.position] : 0;
        }
        await this.sleep(0);
      }
    }

    this.crearFilasEnumeradas(rowsCache);
    this.container.innerHTML = "";
    this.container.appendChild(this.table);
    this.hideSpinner();
  }

  handleTimeout() {
    this.hideSpinner();
    this.container.innerHTML = this.previousTableHTML; // Revert to the previous table state
    window.tabEl.handleChat(
      `Tu seleccion causó un retraso en la operación. Por favor, intenta con una selección más pequeña.`,
      "error"
    );
    state.timer = false;
    state.actualizarReloj();

    switch (state.ultimaVariableAgregada.tipo) {
      case "columna":
        state.eliminarColumnaTD(state.ultimaVariableAgregada.nombre.querySelector(".column-text").textContent);
        break;
      case "fila":
        state.eliminarFilaTD(state.ultimaVariableAgregada.nombre.querySelector(".column-text").textContent);
        break;
      case "valor":
        state.eliminarValorTD(state.ultimaVariableAgregada.nombre.querySelector(".column-text").textContent);
        break;
      default:
        break;
    }

    state.ultimaVariableAgregada.nombre.parentNode.removeChild(state.ultimaVariableAgregada.nombre);

    //state.actualizarIntervaloYRenderizar();
    this.seleccion = null; 
  }

  showSpinner() {
    this.spinner.style.display = "block";
  }

  hideSpinner() {
    this.spinner.style.display = "none";
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
