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
  }
  renderTable(dataTable) {
    this.dataTable = dataTable;
    this.table = document.createElement("table");
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
    // Crear encabezados con letras
    let trueCantidad =
      firstHeader.length +
      cantidadSegunConfig(
        cantidadColumnasAgrupadas,
        cantidadFilasAgrupadas,
        valores,
        totalColumnLength
      );
    this.crearLetrasIndice(indexRow, trueCantidad);
    //primer encabezado
    firstHeader.forEach((header, index) => {
      if (index == 0 && valores.length > 1 && cantidadColumnasAgrupadas >= 1) {
        let td = this.crearTd("");
        headerRow.appendChild(td);
      }
      if (index == 0 && cantidadFilasAgrupadas == 0 && valores.length == 1) {
        let td = this.crearTd("");
        headerRow.appendChild(td);
        return;
      }

      if (index == firstHeader.length - 1) {
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
    //graficar columnas
    columnas.forEach((cols, colIndex) => {
      const columnNames = this.table.insertRow();
      if (colIndex == 0) {
        if (filas.length == 0) {
          let td = this.crearTd("");
          columnNames.appendChild(td);
        }
        filas.forEach((f, filaIndex) => {
          if (columnas.length > 1) {
            let td = this.crearTd("");
            columnNames.appendChild(td);
            // if (filaIndex == 0) {
            // }
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

        return;
      }
      if (filas.length == 0) {
        let td = this.crearTd("");
        columnNames.appendChild(td);
      }
      filas.forEach((f, filaIndex) => {
        const cell = columnNames.insertCell();
        cell.className = "column-name";
        cell.textContent = f;
      });
      uniqueColumns[0].forEach(() => {
        uniqueColumns[colIndex].forEach((c) => {
          let td = this.crearTd(c);
          td.colSpan = cantidadFilasAgrupadas == 0 ? "none" : valores.length;
          columnNames.appendChild(td);
        });
      });
      rowsCache.push(columnNames);
    });
    if (
      valores.length > 1 &&
      cantidadColumnasAgrupadas > 0 &&
      cantidadFilasAgrupadas > 0
    ) {
      const multipleValuesColumnNames = this.table.insertRow();
      filas.forEach(() => {
        const emptySpace = this.crearTd("");
        multipleValuesColumnNames.appendChild(emptySpace);
      });
      const multipleValuesNames = uniqueColumns[uniqueColumns.length - 1];
      for (let i = 1; i <= totalColumnLength / 2; i++) {
        multipleValuesNames.forEach((c) => {
          // console.log(c);
          let td = this.crearTd(castResultName(c));
          multipleValuesColumnNames.appendChild(td);
        });
      }
      rowsCache.push(multipleValuesColumnNames);
    }
    if (!config.columns) {
      uniqueColumns.pop();
    }
    if (!config.rows) {
      uniqueRows.pop();
    }
    //Colocacion de los valores en la tabla y las filas
    if (
      cantidadFilasAgrupadas > 1 ||
      (cantidadColumnasAgrupadas > 1 && cantidadFilasAgrupadas > 1)
    ) {
      //cantidad de filas que debe ocupar cada fila unica
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
      result.forEach((res, resultiIndex) => {
        const subRow = res.slice(1, res.length - columnas.length);
        // const subCol = res.slice(filas.length, res.length);
        const isActualCombination = isEqual(
          intersection(lastSubrow, res),
          lastSubrow
        );
        const diff = difference(res, lastSubrow);
        // const colDiff = difference(res, lastSubrow);
        const isActualMainKey = res.includes(lastRowValue);
        if (!isActualCombination) {
          let rowsNamesAndValues = this.table.insertRow();
          if (!isActualMainKey) {
            //por cada fila que quiero agrupar se hace
            const cell = rowsNamesAndValues.insertCell(0);
            cell.textContent = res[0];
            cell.className = "column-name";
            cell.rowSpan = rowSpanAmount;
            //codigo
          }
          lastRowValue = res[0];
          lastRow = rowsNamesAndValues;
          if ((diff.length >= 4) & (filas.length > 2)) {
            let td = this.crearTd(diff[1]);
            td.rowSpan = subRowsSpanAmount;
            rowsNamesAndValues.appendChild(td);
          }
          if ((diff.length >= 3) & (filas.length == 1)) {
            let td = this.crearTd(diff[0]);
            td.rowSpan = subRowsSpanAmount;
            rowsNamesAndValues.appendChild(td);
          }
          let td = this.crearTd(subRow[subRow.length - 1]);
          rowsNamesAndValues.appendChild(td);
          rowsCache.push(rowsNamesAndValues);
        }
        lastSubrow = subRow;
        const target = flatten(
          filter(
            this.dataTable.data,
            (subarray) => intersection(subarray, res).length === res.length
          )
        );
        valuesPositionsInMatrix.forEach((v) => {
          const cell = lastRow.insertCell();
          cell.textContent = target ? transformValue(target[v.position]) : 0;
        });
      });
    }
    //caso una fila, una columna, un valor
    else if (cantidadFilasAgrupadas == 0) {
      let result = generateCombinations(
        Array.of(...uniqueRows, ...uniqueColumns)
      );
      valuesPositionsInMatrix.forEach((val) => {
        const newRow = this.table.insertRow();
        const rowName = this.crearTd(
          `${castSpanishOperation(val.function)} de ${val.valueName}`
        );
        newRow.appendChild(rowName);
        result.forEach((res, resultiIndex) => {
          const target = flatten(
            filter(
              this.dataTable.data,
              (subarray) => intersection(subarray, res).length === res.length
            )
          );
          const cell = newRow.insertCell();
          cell.textContent = target ? target[val.position] : 0;
        });
        rowsCache.push(newRow);
      });
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
      result.forEach((res, resultiIndex) => {
        // const subCol = res.slice(filas.length, res.length);
        // const colDiff = difference(res, lastSubrow);
        const isActualMainKey = res.includes(lastRowValue);
        if (!isActualMainKey) {
          let rowsNamesAndValues = this.table.insertRow();
          //por cada fila que quiero agrupar se hace
          const cell = rowsNamesAndValues.insertCell(0);
          cell.textContent = res[0];
          cell.className = "column-name";
          //codigo
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
        valuesPositionsInMatrix.forEach((v) => {
          const cell = lastRow.insertCell();
          cell.textContent = target ? transformValue(target[v.position]) : 0;
        });
      });
    }
    this.crearFilasEnumeradas(rowsCache);

    // Limpiar contenedor y añadir la tabla
    this.container.innerHTML = "";
    this.container.appendChild(this.table);
  }
  crearTd(contenido) {
    let td = document.createElement("td");
    td.className = "column-name";
    td.textContent = contenido;
    return td;
  }
}
