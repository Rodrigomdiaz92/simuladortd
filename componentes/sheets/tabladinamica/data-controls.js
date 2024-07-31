import { state } from "../../../state";
import { find } from "lodash";
import _ from "lodash";
import { pgEvent } from "../../../utils/pgEvent";
// Default SortableJS
import Sortable from "sortablejs";

customElements.define(
  "data-controls",
  class HeaderElement extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.intervalo = state.seleccion.intervalo;
      this.render();
    }

    addListeners() {
      state.actualizarIntervaloYRenderizar();

      window.addEventListener("stateUpdated", (event) => {
        const state = event.detail;

        // Actualiza los elementos basado en el estado
        const eliminarButtons = document.querySelectorAll(".eliminar");
        eliminarButtons.forEach((button) => {
          button.disabled =
            state.seleccionTablaDinamica.ejercicioCompletado ||
            state.editingBlocked;
        });
        const allSelectFun = document.querySelectorAll(".select-fun");
        allSelectFun.forEach((select) => {
          select.disabled =
            state.seleccionTablaDinamica.ejercicioCompletado ||
            state.editingBlocked;
        });
        const selectores = document.querySelectorAll("select");
        selectores.forEach((selector) => {
          selector.disabled =
            state.seleccionTablaDinamica.ejercicioCompletado ||
            state.editingBlocked;
        });

        // Obtén las instancias de Sortable para las listas de filas, columnas y valores
        const sortableListRows = Sortable.get(
          document.getElementById("listRow")
        );
        const sortableListColumns = Sortable.get(
          document.getElementById("listCol")
        );
        const sortableListValues = Sortable.get(
          document.getElementById("listValues")
        );

        // Deshabilita las listas basado en el estado, si las instancias de Sortable existen
        if (sortableListRows) {
          sortableListRows.option(
            "disabled",
            state.seleccionTablaDinamica.ejercicioCompletado ||
              state.editingBlocked
          );
        }
        if (sortableListColumns) {
          sortableListColumns.option(
            "disabled",
            state.seleccionTablaDinamica.ejercicioCompletado ||
              state.editingBlocked
          );
        }
        if (sortableListValues) {
          sortableListValues.option(
            "disabled",
            state.seleccionTablaDinamica.ejercicioCompletado ||
              state.editingBlocked
          );
        }

        // Obtén los elementos por su ID
        const candadoButton = document.getElementById("candado");
        const candadoBloqueadoSpan =
          document.getElementById("candado-bloqueado");

        if (state.seleccionTablaDinamica.ejercicioCompletado) {
          // Si el botón 'candado' no existe, créalo
          if (!candadoButton) {
            const button = document.createElement("button");
            button.id = "candado";
            button.textContent = "🔓 Habilitar edición";
            // Añade el botón al DOM
            document.querySelector(".editor-header").appendChild(button);

            // Agrega un event listener al botón que actualiza el estado cuando se hace clic en él
            button.addEventListener("click", () => {
              state.seleccionTablaDinamica.ejercicioCompletado = false;
              state.firstChangeMade = false;
              // Dispara el evento 'stateUpdated'
              const event = new CustomEvent("stateUpdated", { detail: state });
              // pgEvent.onFailEvent("Se ha desbloqueado el ejercicio", []);
              // pgEvent.postEvent("FAILURE", null, [], null);
              window.dispatchEvent(event);
            });
          }
        } else {
          // Si el botón 'candado' existe, elimínalo
          if (candadoButton) {
            candadoButton.remove();
          }
        }

        if (
          state.editingBlocked &&
          !state.seleccionTablaDinamica.ejercicioCompletado
        ) {
          if (!candadoBloqueadoSpan) {
            const span = document.createElement("span");
            span.id = "candado-bloqueado";
            span.textContent = "🔒 Edición bloqueada";
            document.querySelector(".editor-header").appendChild(span);
          }

          // Iniciar temporizador de 5 segundos
          setTimeout(() => {
            const checkSpinnerInterval = setInterval(() => {
              const spinner = document.getElementById("loading-spinner"); // Cambia el selector según tu implementación
              if (!spinner || spinner.style.display === "none") {
                clearInterval(checkSpinnerInterval);

                // Desbloquear después de que el spinner desaparezca
                state.editingBlocked = false;
                const event = new CustomEvent("stateUpdated", {
                  detail: state,
                });
                window.dispatchEvent(event);
              }
            }, 100); // Verifica cada 100ms
          }, 5000);
        } else {
          if (candadoBloqueadoSpan) {
            candadoBloqueadoSpan.remove();
          }
        }
      });

      const debouncedArmarTD = _.debounce(() => {
        state.armarTD();
      }, 100);

      const newDf = new dfd.DataFrame(state.seleccion.datos);
      const columns = newDf.columns;
      const listNamesEl = document.getElementById("listNames");
      const pills = columns
        .map(
          (col) =>
            `<li class="columna-pill" id=${col.toLowerCase()}>
            <div class="pill-info__container">
            <p class="column-text">${col}</p>
              <select class="select-fun">
              <option value="sum">Suma</option>
                <option value="count">Conteo</option>
                <option value="mean">Promedio</option>
                <option value="min">Mínimo</option>
                <option value="max">Máximo</option>
              </select>
            </div>
        <button class="eliminar">X</button>       
            </li>`
        )
        .join("");
      listNamesEl.innerHTML = "";
      listNamesEl.innerHTML = pills;
      new Sortable(listRow, {
        group: "shared",
        animation: 150,
        onAdd: function (evt) {
          const rowName = evt.item.querySelector(".column-text").textContent;
          const others = [
            ...state.seleccionTablaDinamica.columnas,
            ...state.seleccionTablaDinamica.valores.map(
              (v) => Object.keys(v)[0]
            ),
          ];
          if (
            evt.srcElement.children.length > 2 ||
            (evt.from.id == "listNames" && others.includes(rowName))
          ) {
            evt.srcElement.removeChild(evt.item);
          } else {
            state.filaSeleccionadaTD(rowName);
            const newItem = evt.item;
            state.ultimaVariableAgregada = {
              nombre: newItem,
              tipo: "fila",
              // newItem.querySelector(".column-text").textContent
            };
            newItem
              .querySelector(".eliminar")
              .addEventListener("click", function () {
                state.eliminarFilaTD(rowName);
                eliminarElemento(newItem);
              });
            debouncedArmarTD();
          }
        },
        onSort: function (evt) {
          const rows = Array.from(evt.srcElement.querySelectorAll("p")).map(
            (p) => p.textContent
          );
          state.ordenarFilasSeleccionadasTD(rows);
          debouncedArmarTD();
        },
        onRemove: function (evt) {
          const rowName = evt.item.querySelector(".column-text").textContent;
          state.eliminarFilaTD(rowName);
        },
      });

      new Sortable(listCol, {
        group: "shared",
        animation: 150,
        onAdd: function (evt) {
          const columnName = evt.item.querySelector(".column-text").textContent;
          const others = [
            ...state.seleccionTablaDinamica.filas,
            ...state.seleccionTablaDinamica.valores.map(
              (v) => Object.keys(v)[0]
            ),
          ];
          if (
            evt.srcElement.children.length > 2 ||
            (evt.from.id == "listNames" && others.includes(columnName))
          ) {
            evt.srcElement.removeChild(evt.item);
          } else {
            state.columnaSeleccionadaTD(columnName);
            const newItem = evt.item;
            state.ultimaVariableAgregada = {
              nombre: newItem,
              tipo: "columna",
              // newItem.querySelector(".column-text").textContent
            };
            newItem
              .querySelector(".eliminar")
              .addEventListener("click", function () {
                state.eliminarColumnaTD(columnName);
                eliminarElemento(newItem);
              });
            debouncedArmarTD();
          }
        },
        onSort: function (evt) {
          const cols = Array.from(evt.srcElement.querySelectorAll("p")).map(
            (p) => p.textContent
          );
          state.ordenarColumnasSeleccionadasTD(cols);
          debouncedArmarTD();
        },
        onRemove: function (evt) {
          const columnName = evt.item.querySelector(".column-text").textContent;
          state.eliminarColumnaTD(columnName);
        },
      });
      new Sortable(listValues, {
        group: "shared", // set both lists to same group
        animation: 150,
        onAdd: function (evt) {
          const valuesName = evt.item.querySelector(".column-text").textContent;
          if (
            evt.srcElement.children.length > 2 ||
            state.seleccionTablaDinamica.valores.some(
              (v) => Object.keys(v)[0] == valuesName
            )
          ) {
            evt.srcElement.removeChild(evt.item);
          } else {
            const thisSelector = evt.item.querySelector("select");
            thisSelector.value = "sum";
            state.valorSeleccionadaTD(valuesName, "sum");
            const newItem = evt.item;
            state.ultimaVariableAgregada = {
              nombre: newItem,
              tipo: "valor",
              // newItem.querySelector(".column-text").textContent
            };
            // Agregar un event listener a cada selector
            const selector = newItem.querySelector(
              ".pill-info__container select"
            );
            selector.addEventListener("change", function (event) {
              const padre = selector.parentElement.parentElement;
              const valorSeleccionado = event.target.value;
              state.agregarFuncionTD(
                padre.querySelector(".column-text").textContent,
                valorSeleccionado
              );
              debouncedArmarTD();
            });
            newItem
              .querySelector(".eliminar")
              .addEventListener("click", function () {
                state.eliminarValorTD(valuesName);
                eliminarElemento(newItem);
              });
          }
        },
        onSort: function (evt) {
          const vals = Array.from(evt.srcElement.querySelectorAll("p")).map(
            (p) => p.textContent
          );
          state.ordenarValoresSeleccionadosTD(vals);
          debouncedArmarTD();
        },
        onRemove: function (evt) {
          const valuesName = evt.item.querySelector(".column-text").textContent;
          const thisSelector = evt.item.querySelector("select");
          thisSelector.value = "opcion1";
          state.eliminarFuncionTD();
          state.eliminarValorTD(valuesName);
          debouncedArmarTD();
        },
      });
      function eliminarElemento(item) {
        if (item && item.parentNode) {
          item.parentNode.removeChild(item); // Eliminar el elemento de la lista
          debouncedArmarTD();
        } else {
          console.warn("Elimino un elemento sin nodo padre");
        }
      }

      new Sortable(listNames, {
        group: {
          name: "shared",
          pull: "clone", // To clone: set pull to 'clone'
          put: false,
        },
        animation: 150,
      });

      const botonMostrar = document.getElementById("menu-editar" + this.id);
      botonMostrar.addEventListener("click", () => {
        const insertData = this.querySelector(".insert-data");
        insertData.classList.toggle("active");
        if (botonMostrar.textContent == "X") {
          botonMostrar.textContent = "Editar";
          return;
        }
        botonMostrar.textContent = "X";
      });
    }

    render() {
      this.innerHTML = `
        <div class="insert-data">
          <div class="editor-header">
            <button id="menu-editar">X</button>
            <i class="fa-solid fa-table"></i>
            <h3>Editor de tablas dinámicas</h3>            
          </div>
          <div class="insert-data__container">
            <div class="controls-container tabla-dinamica">
                <div class="control">
                  <label>Intervalo de datos:</label>
                  <input value=${this.intervalo}></input>
                </div>
              <div class="control">
                <label>Filas</label>
                  <ul class="sortable-list" id="listRow">
                  </ul>
              </div>
              <div class="control">
                <label>Columnas</label>
                  <ul class="sortable-list" id="listCol">
                  </ul>
              </div>
              <div class="control">
                <label>Valores</label>
                  <ul class="sortable-list editable" id="listValues">
              </ul>
                </div>
              </div>
              <div class="draggable-columns__container">
              <ul id="listNames">     
                </ul>
              </div>
          </div>
        </div>
            `;
      const style = document.createElement("style");
      style.innerHTML = `
      #listNames{
        padding:15px 10px;
        padding-bottom:50px;
        overflow:auto;
      }
      .insert-data.active{
        right:-600px;
        transition: right 0.3s ease;
      }
      .editor-header{
        position:relative;
      }
      #listNames .eliminar{
        display: none;
       }
       #listNames select, #listRow select, #listCol select{
        display:none;
       }
       .controls-container.tabla-dinamica{
        margin:0 15px;
        padding-top:15px;
       }
      #menu-editar{
        border-top-left-radius:10%;
        border-bottom-left-radius:10%;
        cursor:pointer;
        position: absolute;
        top: 2px;
        left: -52px;
        z-index: 5;
        width: 53px;
        height: 100%;
        border-style: none;
        color: #0b57d0;
        background-color: #e1e9f7;
        font-weight: 600;
      }
      .columna-pill, .sortable-list{
        display: flex;
        max-width: 130px;
        border-radius: 4%;
        background-color: white;
        justify-content: center;
        flex-wrap: nowrap;
        flex-direction: column;
        align-items: flex-start;
      }

      .columna-pill > h3{
        font-weight:500;
        color:black;
      }
      .columna-pill.editable{
        flex-direction:column;
        gap:5px;
        max-width:200px;
      }
      .columna-pill.editable > label{
        font-size:12px;
      }
      .insert-data__container{
        width:100%;
        display:flex;
        height:100%;
      }
      .draggable-columns__container{
        border-left:1px solid gray;
        display: flex;
        gap:12px;
        font-size:15px;
        height:100%;
        flex-direction: column;
        justify-content: flex-start;
      }
      li.columna-pill > .sortable-list{
        flex-direction:row;
        width:100%;
      }
      #listNames .columna-pill{
        margin: 10px 0px;
        cursor: move;
        max-width:min-content;
        padding:0 5px;
        transition: box-shadow 0.3s ease; 
        background-color : transparent
      }
      #listNames .columna-pill:hover {
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); 
      }
      .sortable-list .columna-pill{
        cursor: move;
        padding: 5px;
        background-color: #f3f3f3;
        transition: box-shadow 0.3s ease;
      }

      #listValues .columna-pill{
        cursor: move;
        padding: 5px;
        background-color: #f3f3f3;
        transition: box-shadow 0.3s ease; 
      }
      
      #listValues .columna-pill:hover {
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      }
      .sortable-list .columna-pill {
        flex-direction:row;
        width:100%;
        max-width:100%;
        justify-content:space-between;
        align-items:center;
      }
      .sortable-list{
        max-width:100%;
        gap:10px;
        padding:10px;
      }
      .eliminar{
        border-radius:50%;
        border-style:none;
      }
      .eliminar:hover{
        filter: brightness(90%);
      }
              `;
      this.appendChild(style);
      this.addListeners();
    }
  }
);
