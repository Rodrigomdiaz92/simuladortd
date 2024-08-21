import Sortable from "sortablejs";
import { state } from "../state";
export function llenarListas(seleccion) {
  const { filas, columnas, valores } = seleccion;
  filas.forEach((fila) => {
    const rowList = document.querySelector("ul#listRow");
    const elementoFila = document.querySelector(`li#${fila.toLowerCase()}`);
    const rowName = elementoFila.querySelector(".column-text").textContent;
    const clonFila = Sortable.utils.clone(elementoFila);
    clonFila.querySelector(".eliminar").addEventListener("click", function () {
      state.eliminarFilaTD(rowName);
      eliminarElemento(clonFila);
    });
    rowList.appendChild(clonFila);
  });

  columnas.forEach((columna) => {
    const listCol = document.querySelector("ul#listCol");
    const elementoColumna = document.querySelector(
      `li#${columna.toLowerCase()}`
    );
    const colName = elementoColumna.querySelector(".column-text").textContent;
    const clonColumna = Sortable.utils.clone(elementoColumna);
    clonColumna
      .querySelector(".eliminar")
      .addEventListener("click", function () {
        state.eliminarColumnaTD(colName);
        eliminarElemento(clonColumna);
      });
    listCol.appendChild(clonColumna);
  });

  valores.forEach((valor) => {
    const listValues = document.querySelector("ul#listValues");
    const elementoValor = document.querySelector(
      `li#${Object.keys(valor)[0].toLowerCase()}`
    );
    const rowName = elementoValor.querySelector(".column-text").textContent;
    const clonValor = Sortable.utils.clone(elementoValor);
    clonValor.querySelector(".eliminar").addEventListener("click", function () {
      state.eliminarValorTD(rowName);
      eliminarElemento(clonValor);
    });
    const selector = clonValor.querySelector("select");
    selector.value = Object.values(valor)[0];
    selector.addEventListener("change", function (event) {
      const padre = selector.parentElement.parentElement;
      const valorSeleccionado = event.target.value;
      state.agregarFuncionTD(
        padre.querySelector(".column-text").textContent,
        valorSeleccionado
      );
      state.armarTD();
    });
    listValues.appendChild(clonValor);
  });
}
function eliminarElemento(item) {
  item.parentNode.removeChild(item); // Eliminar el elemento de la lista
  state.armarTD();
}
export function completarHojaGraficos(seleccion){
  const graficoEl = document.querySelector("grafico-el")
  graficoEl.querySelector("#tipoGrafico").value = seleccion.tipoGrafico
  graficoEl.updateOptions()
  graficoEl.querySelector("#etiquetas-grafico").value = seleccion.etiqueta
  graficoEl.querySelector("#porcentaje-circulo").value = seleccion.huecoCirculo
  graficoEl.querySelector("#valor-grafico").value = seleccion.valorGrafico
  graficoEl.querySelector("#ejeX").value = seleccion.ejeX
  graficoEl.querySelector("#graficoApilado").checked = seleccion.apilado
  graficoEl.querySelector("#escala").value = seleccion.escala
  const dropdownColumnas = graficoEl.querySelector("#dropdown-content").querySelectorAll("input")
  dropdownColumnas.forEach((input)=>{
    if(seleccion.serie.includes(input.id)){
      input.checked = true
    }
  })
}