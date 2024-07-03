import { difference, filter, flatten, intersection, isEqual } from "lodash";
import {
  generateCombinations,
  getParametrosTablaDinamica,
  defineTotalColLength,
  castSpanishOperation,
  getFirstHeader,
  cantidadSegunConfig,
  transformValue,
  castResultName,
} from "../utils/pivot-table";
import { DataTableView } from "./DataTableView";

export class PivotTable extends DataTableView {
  constructor(id, seleccion) {
    super(id);
    this.seleccion = seleccion;
    this.spinner = document.getElementById("loading-spinner");
    this.timeoutDuration = 20000; // 20 seconds
  }

  showSpinner() {
    this.spinner.style.display = "block";
  }

  hideSpinner() {
    this.spinner.style.display = "none";
  }

  async renderTable(dataTable) {
    this.showSpinner();
    this.dataTable = dataTable;
    this.table = document.createElement("table");

    const previousState = this.container.innerHTML;

    const timeout = setTimeout(() => {
      this.container.innerHTML = previousState;
      this.hideSpinner();
      window.tabEl.handleChat
    }, this.timeoutDuration);

    try {
      await this.createTable();
    } catch (error) {
      window.tabEl.handleChat(
        `Tu seleccion causó un retraso en la operación. Por favor, intenta con una selección más pequeña.`,
        "error"
      );
      this.container.innerHTML = previousState;
    } finally {
      clearTimeout(timeout);
      this.hideSpinner();
    }
  }

  async createTable() {
    const indexRow = this.table.insertRow();
    const headerRow = this.table.insertRow();
    const { filas, columnas, valores } = this.seleccion;
    let rowsCache = [];

    const { valuesPositionsInMatrix, uniqueColumns, uniqueRows, config } =
      getParametrosTablaDinamica(filas, valores, columnas, this.dataTable);
    const cantidadFilasAgrupadas = filas.length;
    const cantidadColumnasAgrupadas = columnas.length;

    const firstHeader = getFirstHeader(columnas, valores, filas);
    const totalColumnLength = defineTotalColLength(
      uniqueColumns,
      cantidadFilasAgrupadas,
      cantidadColumnasAgrupadas,
      valores
    );

    let trueCantidad =
      firstHeader.length +
      cantidadSegunConfig(
        cantidadColumnasAgrupadas,
        cantidadFilasAgrupadas,
        valores,
        totalColumnLength
      );
    this.crearLetrasIndice(indexRow, trueCantidad);

    firstHeader.forEach((header, index) => {
      if (index === 0 && valores.length > 1 && cantidadColumnasAgrupadas >= 1) {
        let td = this.crearTd("");
        headerRow.appendChild(td);
      }
      if (index === 0 && cantidadFilasAgrupadas === 0 && valores.length === 1) {
        let td = this.crearTd("");
        headerRow.appendChild(td);
        return;
      }

      if (index === firstHeader.length - 1) {
        let td = this.crearTd(header);
        td.colSpan =
          totalColumnLength +
          (cantidadFilasAgrupadas ? cantidadFilasAgrupadas - 1 : 0);
        headerRow.appendChild(td);
        return;
      }
      let td = this.crearTd(header);
      headerRow.appendChild(td);
    });

    rowsCache.push(headerRow);

    const colSpanAmount = uniqueColumns.slice(1).reduce((acc, curr) => {
      acc *= curr.length;
      return acc;
    }, 1);

    for (let colIndex = 0; colIndex < columnas.length; colIndex++) {
      this.renderColumnHeader(colIndex, filas, columnas, uniqueColumns, colSpanAmount, rowsCache);
      await this.yieldExecution();
    }

    if (valores.length > 1 && cantidadColumnasAgrupadas > 0 && cantidadFilasAgrupadas > 0) {
      this.renderMultipleValuesColumnNames(filas, totalColumnLength, uniqueColumns, rowsCache);
      await this.yieldExecution();
    }

    if (!config.columns) {
      uniqueColumns.pop();
    }
    if (!config.rows) {
      uniqueRows.pop();
    }

    if (cantidadFilasAgrupadas > 1 || (cantidadColumnasAgrupadas > 1 && cantidadFilasAgrupadas > 1)) {
      await this.renderComplexTableValues(uniqueRows, uniqueColumns, filas, columnas, valores, valuesPositionsInMatrix, rowsCache);
    } else if (cantidadFilasAgrupadas === 0) {
      await this.renderSimpleTableValues(uniqueRows, uniqueColumns, valores, valuesPositionsInMatrix, rowsCache);
    } else if (cantidadFilasAgrupadas > 0) {
      await this.renderIntermediateTableValues(uniqueRows, uniqueColumns, valores, valuesPositionsInMatrix, rowsCache);
    }

    this.crearFilasEnumeradas(rowsCache);

    this.container.innerHTML = "";
    this.container.appendChild(this.table);
  }

  renderColumnHeader(colIndex, filas, columnas, uniqueColumns, colSpanAmount, rowsCache) {
    const columnNames = this.table.insertRow();

    if (colIndex === 0) {
      if (filas.length === 0) {
        let td = this.crearTd("");
        columnNames.appendChild(td);
      }
      for (const f of filas) {
        if (columnas.length > 1) {
          let td = this.crearTd("");
          columnNames.appendChild(td);
        } else {
          const cell = columnNames.insertCell();
          cell.className = "column-name";
          cell.textContent = f;
        }
      }
      for (const c of uniqueColumns[0]) {
        let td = this.crearTd(c);
        td.colSpan = colSpanAmount;
        columnNames.appendChild(td);
      }
      rowsCache.push(columnNames);
      return;
    }

    if (filas.length === 0) {
      let td = this.crearTd("");
      columnNames.appendChild(td);
    }
    for (const f of filas) {
      const cell = columnNames.insertCell();
      cell.className = "column-name";
      cell.textContent = f;
    }
    for (const _ of uniqueColumns[0]) {
      for (const c of uniqueColumns[colIndex]) {
        let td = this.crearTd(c);
        td.colSpan = filas.length === 0 ? "none" : valores.length;
        columnNames.appendChild(td);
      }
    }
    rowsCache.push(columnNames);
  }

  renderMultipleValuesColumnNames(filas, totalColumnLength, uniqueColumns, rowsCache) {
    const multipleValuesColumnNames = this.table.insertRow();
    for (const _ of filas) {
      const emptySpace = this.crearTd("");
      multipleValuesColumnNames.appendChild(emptySpace);
    }
    const multipleValuesNames = uniqueColumns[uniqueColumns.length - 1];
    for (let i = 1; i <= totalColumnLength / 2; i++) {
      for (const c of multipleValuesNames) {
        let td = this.crearTd(castResultName(c));
        multipleValuesColumnNames.appendChild(td);
      }
    }
    rowsCache.push(multipleValuesColumnNames);
  }

  async renderComplexTableValues(uniqueRows, uniqueColumns, filas, columnas, valores, valuesPositionsInMatrix, rowsCache) {
    const rowSpanAmount = uniqueRows.slice(1).reduce((acc, curr) => {
      acc *= curr.length;
      return acc;
    }, 1);
    const subRowsSpanAmount = uniqueRows.slice(filas.length - 1)[0].length;
    if (valores.length > 1) {
      uniqueColumns.pop();
    }
    let result = generateCombinations(Array.of(...uniqueRows, ...uniqueColumns));
    let lastSubrow = "";
    let lastRow;
    let lastRowValue;
    for (const res of result) {
      const subRow = res.slice(1, res.length - columnas.length);
      const isActualCombination = isEqual(intersection(lastSubrow, res), lastSubrow);
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
      const target = flatten(filter(this.dataTable.data, (subarray) => intersection(subarray, res).length === res.length));
      for (const v of valuesPositionsInMatrix) {
        const cell = lastRow.insertCell();
        cell.textContent = target ? transformValue(target[v.position]) : 0;
      }
      await this.yieldExecution();
    }
  }

  async renderSimpleTableValues(uniqueRows, uniqueColumns, valores, valuesPositionsInMatrix, rowsCache) {
    let result = generateCombinations(Array.of(...uniqueRows, ...uniqueColumns));
    for (const val of valuesPositionsInMatrix) {
      const newRow = this.table.insertRow();
      const rowName = this.crearTd(`${castSpanishOperation(val.function)} de ${val.valueName}`);
      newRow.appendChild(rowName);
      for (const res of result) {
        const target = flatten(filter(this.dataTable.data, (subarray) => intersection(subarray, res).length === res.length));
        const cell = newRow.insertCell();
        cell.textContent = target ? target[val.position] : 0;
      }
      rowsCache.push(newRow);
      await this.yieldExecution();
    }
  }

  async renderIntermediateTableValues(uniqueRows, uniqueColumns, valores, valuesPositionsInMatrix, rowsCache) {
    if (valores.length > 1) {
      uniqueColumns.pop();
    }
    let result = generateCombinations(Array.of(...uniqueRows, ...uniqueColumns));
    let lastSubrow = "";
    let lastRow;
    let lastRowValue;
    for (const res of result) {
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
      const target = flatten(filter(this.dataTable.data, (subarray) => intersection(subarray, res).length === res.length));
      for (const v of valuesPositionsInMatrix) {
        const cell = lastRow.insertCell();
        cell.textContent = target ? transformValue(target[v.position]) : 0;
      }
      await this.yieldExecution();
    }
  }

  crearTd(contenido) {
    let td = document.createElement("td");
    td.className = "column-name";
    td.textContent = contenido;
    return td;
  }

  yieldExecution() {
    return new Promise(resolve => setTimeout(resolve, 0));
  }
}
