import { getComplexRangeString, castInterval } from "../utils/table";
import { state } from "../state";
// Vista
export class DataTableView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.globalStartCell;
    this.globalEndCell;
    this.table;
    this.cantidadColumnas;
    this.cantidadFilas;
    this.seleccion = {};
  }

  setSelectionRequirements(requirements) {
    this.minRows = requirements.minRows;
    this.minCols = requirements.minCols;
  }

  renderTable(dataTable) {
    this.dataTable = dataTable;
    this.table = document.createElement("table");
    const indexRow = this.table.insertRow();
    const headerRow = this.table.insertRow();
    let rowsCache = [];
    // Crear encabezados con letras
    this.crearLetrasIndice(indexRow, dataTable.headers.length);
    dataTable.headers.forEach((header, index) => {
      let td = document.createElement("td");
      td.className = "column-name";
      td.textContent = header;
      headerRow.appendChild(td);
    });
    rowsCache.push(headerRow);
    this.cantidadColumnas = dataTable.headers.length;
    this.dataTable.data.forEach((rowData) => {
      const row = this.table.insertRow();
      rowData.forEach((data) => {
        const cell = row.insertCell();
        cell.textContent = data;
      });
      rowsCache.push(row);
    });
    // Crear filas de datos con enumeración
    this.crearFilasEnumeradas(rowsCache);

    this.cantidadFilas = dataTable.data.length;
    this.dataTable.data.unshift(this.dataTable.headers);

    // Limpiar contenedor y añadir la tabla
    this.container.innerHTML = "";
    this.container.appendChild(this.table);
  }
  crearLetrasIndice(indexRow, columnsQuantity) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const limit =
      columnsQuantity > letters.length ? letters.length : columnsQuantity;
    for (let i = 0; i < limit; i++) {
      if (i == 0) {
        let td = document.createElement("td");
        td.textContent = "";
        td.id = "all-cells";
        indexRow.appendChild(td);
      }
      const th = document.createElement("th");
      th.classList.add("th-index", "celda-encabezado-columnas");
      th.textContent = letters[i];
      indexRow.appendChild(th);
    }
    if (columnsQuantity > letters.length) {
      let indiceLetra = 0;
      let numeroColumna = 1;
      for (let i = 0; i < columnsQuantity - letters.length; i++) {
        const letra = letters[indiceLetra];
        if (letra === "Z") {
          indiceLetra = 0;
          numeroColumna++;
        } else {
          indiceLetra++;
        }
        const th = document.createElement("th");
        th.classList.add("th-index", "celda-encabezado-columnas");
        th.textContent = letra + numeroColumna;
        indexRow.appendChild(th);
      }
    }
  }
  obtenerIndexCoordenadas(celda) {
    // al elemento celda en HTML
    const x = {
      columna: celda.cellIndex - 1,
      fila: celda.parentNode.rowIndex - 1,
    };
    return x;
  }
  crearFilasEnumeradas(rowsCache) {
    rowsCache.forEach((r, i) => {
      const cell = r.insertCell(0);
      cell.className = "celda-encabezado-filas row-index";
      cell.textContent = i + 1;
    });
  }

  seleccionarRangoColumnaCompleta(columnaInicio, columnaFin) {
    this.seleccionarRangoCardinal(
      0,
      this.cantidadFilas - 1,
      columnaInicio,
      columnaFin
    );
  }

  seleccionarRangoFilaCompleta(filaInicio, filaFin) {
    this.seleccionarRangoCardinal(
      filaInicio,
      filaFin,
      0,
      this.cantidadColumnas - 1
    );
  }

  selecionarUnicaCelda(fila, columna) {
    this.seleccionarRangoCardinal(fila, fila, columna, columna);
  }
  limpiarSeleccion() {
    const cells = document.querySelectorAll("td"); // reemplazar por array for each;
    cells.forEach((cell) => cell.classList.remove("selected"));
  }
  limpiarColumnasSeleccionadas() {
    const selectedColumns = document.querySelectorAll(
      ".celda-encabezado-columnas"
    );
    selectedColumns.forEach((column) => {
      column.style.backgroundColor = ""; // Limpiar el color de fondo de las columnas seleccionadas
    });
  }
  limpiarNumerosSeleccionados() {
    const selectedNumbers = document.querySelectorAll(
      ".celda-encabezado-filas"
    );
    selectedNumbers.forEach((number) => {
      number.style.backgroundColor = ""; // Limpiar el color de fondo de los números seleccionados
    });
  }

  // Obtener el rango seleccionado para la verificación de requisitos
  getSelectedRange() {
    if (!this.seleccion) {
      return null;
    }

    const startCell = this.seleccion.selectedCellsExtremes[0];
    const endCell = this.seleccion.selectedCellsExtremes[1];

    const startRowIndex = parseInt(startCell.match(/\d+/)[0], 10);
    const startColIndex = startCell.charCodeAt(0) - 65;

    const endRowIndex = parseInt(endCell.match(/\d+/)[0], 10);
    const endColIndex = endCell.charCodeAt(0) - 65;

    return {
      startRowIndex,
      endRowIndex,
      startColIndex,
      endColIndex,
    };
  }

  seleccionarRangoCardinal(filaInicio, filaFin, columnaInicio, columnaFin) {
    this.limpiarSeleccion();
    const startRowIndex = filaInicio > filaFin ? filaFin : filaInicio;
    const endRowIndex = filaInicio > filaFin ? filaInicio : filaFin;
    const startColIndex =
      columnaInicio > columnaFin ? columnaFin : columnaInicio;
    const endColIndex = columnaInicio > columnaFin ? columnaInicio : columnaFin;

    const selectedCellsFullList = [];
    for (let i = startRowIndex; i <= endRowIndex; i++) {
      for (let j = startColIndex; j <= endColIndex; j++) {
        const cell = this.table.rows[i + 1].cells[j + 1];

        cell.classList.add("selected");
        selectedCellsFullList.push(`${String.fromCharCode(65 + j)}${i + 1}`);
      }
    }

    const selectedCellsExtremes = [
      `${String.fromCharCode(65 + startColIndex)}${startRowIndex + 1}`,
      `${String.fromCharCode(65 + endColIndex)}${endRowIndex + 1}`,
    ];

    const selectedCellsAsSimpleRangeString = `${selectedCellsExtremes[0]}:${selectedCellsExtremes[1]}`;

    const selectedCellsAsComplexRangeString = getComplexRangeString(
      startRowIndex,
      endRowIndex,
      startColIndex,
      endColIndex,
      this.table
    );
    this.seleccion = {
      selectedCellsFullList: selectedCellsFullList,
      selectedCellsExtremes: selectedCellsExtremes,
      selectedCellsAsSimpleRangeString: selectedCellsAsSimpleRangeString,
      selectedCellsAsComplexRangeString: selectedCellsAsComplexRangeString,
    };
    this.getSelectedCords();
    this.getSelectedDataCollection();
  }

  selectAllCells() {
    this.limpiarSeleccion();

    for (let i = 0; i < this.cantidadFilas + 1; i++) {
      for (let j = 0; j < this.cantidadColumnas; j++) {
        const cell = this.table.rows[i + 1].cells[j + 1];
        cell.classList.add("selected");
      }
    }
  }
  getSelectedDataCollection() {
    const coords = this.seleccion.selectedCellsExtremes;
    const [startCellCoord, endCellCoord] = coords.map((item) => {
      const matches = item.match(/\d+/); // Encuentra todos los dígitos en el string
      return matches ? parseInt(matches[0], 10) : null; // Convierte el primer conjunto de dígitos a número
    });
    const [letterStart, letterEnd] = coords.map((item) => {
      const matches = item.match(/\D+/); // Encuentra todas las letras en el string
      return matches ? matches[0].charCodeAt(0) - 64 : null; // Convierte la letra a su valor ASCII y resta 64 para obtener su posición en el alfabeto
    });
    const data = this.dataTable.data.slice(startCellCoord - 1, endCellCoord);
    const newEntries = this.dataTable.headers.slice(letterStart - 1, letterEnd);
    const newData = {};

    //console.log("La data es: ", data);

    // Iterar sobre las columnas
    newEntries.forEach((column, columnIndex) => {
      // Usar el primer valor de la columna como clave en el nuevo objeto
      let trueIndex = this.dataTable.headers.indexOf(column);
      const key = data[0][trueIndex];
      newData[key] = [];

      // Iterar sobre las filas (ignorando la primera fila que contiene las claves)
      for (let i = 1; i < data.length; i++) {
        newData[key].push(data[i][trueIndex]);
      }
    });

    state.actualizarSeleccion({
      intervalo: `${this.seleccion.selectedCellsExtremes[0]}:${this.seleccion.selectedCellsExtremes[1]}`,
      datos: newData,
    });
    return newData;
  }
  setearEventos() {
    this.table.addEventListener("mousedown", (e) => {
      this.limpiarSeleccion();
      this.globalStartCell = e.target;
      if (!e.target.id && e.target.tagName === "TD") {
        // this.selectRange(e.target, e.target);
        const coordenadas = this.obtenerIndexCoordenadas(e.target);
        this.selecionarUnicaCelda(coordenadas.fila, coordenadas.columna);
        e.preventDefault();
      }
      if (e.target.classList.contains("celda-encabezado-columnas")) {
        const columnIndex = e.target.cellIndex - 1;
        this.seleccionarRangoColumnaCompleta(columnIndex, columnIndex);
        e.preventDefault();
      }
      if (e.target.classList.contains("celda-encabezado-filas")) {
        const rowIndex = e.target.parentNode.rowIndex - 1;
        this.seleccionarRangoFilaCompleta(rowIndex, rowIndex);
        e.preventDefault();
      }
      if (e.target.id == "all-cells") {
        const totalFilas = this.cantidadFilas - 1;
        const totalColumnas = this.cantidadColumnas - 1;
        this.seleccionarRangoCardinal(0, totalFilas, 0, totalColumnas);
        e.preventDefault();
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (this.globalStartCell) {
        let globalStartCellColumnIndex = this.globalStartCell.cellIndex - 1;
        let globalStartCellRowIndex =
          this.globalStartCell.parentNode.rowIndex - 1;

        if (!this.globalEndCell || this.globalEndCell != e.target) {
          this.globalEndCell = e.target;
          let globalEndCellColumnIndex = this.globalEndCell.cellIndex - 1;
          let globalEndCellRowIndex =
            this.globalEndCell.parentNode.rowIndex - 1;
          if (
            this.globalStartCell.tagName == "TD" &&
            e.target.tagName == "TD" &&
            e.target.classList.length == 0 &&
            !e.target.id
          ) {
            this.seleccionarRangoCardinal(
              globalStartCellRowIndex,
              globalEndCellRowIndex,
              globalStartCellColumnIndex,
              globalEndCellColumnIndex
            );
            e.preventDefault();
          } else if (e.target.tagName == "TD" || e.target.tagName == "TH") {
            if (
              this.globalStartCell.classList.contains(
                "celda-encabezado-columnas"
              )
            ) {
              this.seleccionarRangoColumnaCompleta(
                globalStartCellColumnIndex,
                globalEndCellColumnIndex
              );
              e.preventDefault();
            } else if (
              this.globalStartCell.classList.contains("celda-encabezado-filas")
            ) {
              this.seleccionarRangoFilaCompleta(
                globalStartCellRowIndex,
                globalEndCellRowIndex
              );
              e.preventDefault();
            }
          }
        }
      }

      document.addEventListener("mouseup", () => {
        this.globalStartCell = null;
        this.globalEndCell = null;
      });
      document.addEventListener("mouseup", function () {
        this.globalStartCell = null;
        this.globalEndCell = null;
      });

      // Scrollear la tabla si el mouse está en los bordes y hay una selección
      if (this.globalStartCell && this.globalEndCell) {
        const mousePositionX = e.clientX - this.container.getBoundingClientRect().left;
        const mousePositionY = e.clientY - this.container.getBoundingClientRect().top;

        // Scrolleo horizontal
        if (mousePositionX > this.container.clientWidth - 100) {
          this.container.scrollLeft += 10 * ((mousePositionX - (this.container.clientWidth - 100)) / 100);
        }

        if (mousePositionX < 100) {
          this.container.scrollLeft -= 10 * ((100 - mousePositionX) / 100);
        }

        // Scrolleo vertical
        if (mousePositionY > this.container.clientHeight - 100) {
          this.container.scrollTop += 10 * ((mousePositionY - (this.container.clientHeight - 100)) / 100);
        }

        if (mousePositionY < 100) {
          this.container.scrollTop -= 10 * ((100 - mousePositionY) / 100);
        }
      }
    });
  }

  getSelectedCords() {
    this.limpiarColumnasSeleccionadas();
    this.limpiarNumerosSeleccionados();
    const coords = this.seleccion.selectedCellsExtremes;
    const intervalo = this.seleccion.selectedCellsAsComplexRangeString;

    // Extraer las coordenadas de las celdas seleccionadas
    const [startCoords, endCoords] = coords.map((coord) => {
      const matches = coord.match(/[A-Z]+|\d+/g);
      return [matches[0], matches[1]]; // matches[0] contiene la letra de la columna, matches[1] contiene el número de la fila
    });
    // Encontrar las letras de las coordenadas extraídas
    const startLetter = startCoords[0];
    const endLetter = endCoords[0];

    // Encontrar los elementos de la fila superior correspondientes a estas letras
    const startLetterIndex = startLetter.charCodeAt(0) - 64 + 1; // Convertir la letra a su índice de columna
    const endLetterIndex = endLetter.charCodeAt(0) - 64 + 1;

    for (let i = startLetterIndex; i <= endLetterIndex; i++) {
      const letterElement = document.querySelector(
        `.celda-encabezado-columnas:nth-child(${i})`
      );
      if (letterElement) {
        letterElement.style.backgroundColor = "#d3ecf5";
      }

      const startNumber = parseInt(startCoords[1]);
      const endNumber = parseInt(endCoords[1]);
      for (let i = startNumber; i <= endNumber; i++) {
        const numberElement = document.querySelector(
          `tr:nth-child(${i + 1}) .celda-encabezado-filas.row-index`
        );
        if (numberElement) {
          numberElement.style.backgroundColor = "#d3ecf5";
        }
      }
      // Actualizar el valor del input con id "rango"
      const inputRango = document.getElementById("rango-celda");
      if (inputRango) {
        inputRango.value = castInterval(intervalo);
      } else {
        console.error("No se encontró un elemento con id 'rango-celda'");
      }
    }
  }
}
