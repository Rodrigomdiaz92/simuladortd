import Chart from "chart.js/auto";
import { state } from "../../state";

customElements.define(
  "grafico-el",
  class GraficoElement extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.render();
      this.addListeners();
      this.populateOptions();
    }

    render() {
      this.innerHTML = `
        <div class="container grafico">
          <div class="insert-view">
            <div id="presentacion-grafico">
              <img class="grafico-preview" src="https://www.iconpacks.net/icons/1/free-pie-chart-icon-683-thumb.png"></img>
              <h3>Configura tu gráfico</h3>
            </div>
            <canvas id="plot_div" class="view-container"></canvas>        
            <div class="insert-data-grafic">
              <div class="editor-header">
                <button id="menu-mostrar">X</button>
                <i class="fa-solid fa-chart-pie"></i>
                <h3>Editor de gráficos</h3>
              </div>
              <div class="controls-container">
                <ul id="controles-grafico">
                  <div class="control">
                    <label>Intervalo de datos:</label>
                    <input class="graph-input" value="${state.seleccion.intervalo}" readonly>
                  </div>
                  <div class="control">
                    <input class="graph-input" type="text" id="titulo-grafico" placeholder="Ingresa aqui el titulo de tu grafico">
                    <label>Tipo de gráfico:</label>
                    <select class="graph-select" id="tipoGrafico">              
                      <option value="none">---</option>
                      <option value="torta">Gráfico de Torta</option>
                      <option value="barras">Gráfico de Barras</option>
                    </select>
                  </div>
                  <div id="confi-torta" class="hidden">              
                    <label>Columna:</label>
                    <select class="graph-select" id="etiquetas-grafico"></select>
                    <label>Hueco del círculo(%)</label>
                    <input class="graph-input" type="number" id="porcentaje-circulo" placeholder="Predeterminado">
                  </div>
                  <div id="confi-barras" class="hidden">              
                    <label>Eje X:</label>
                    <select class="graph-select" id="ejeX"></select>
                    <label>Serie:</label>
                    <select class="graph-select" id="serie"></select>
                    <h3>Personalizar</h3>
                    <label>Titulo eje X</label>
                    <input class="graph-input" type="text" id="titulo-grafico-x">
                    <label>Titulo eje Y</label>
                    <input class="graph-input" type="text" id="titulo-grafico-y">
                    <label>Factor de escala Eje vertical</label>
                    <select class="graph-select" id="escala">
                      <option value="1000">Predeterminado</option>
                      <option value="0.01">0,01</option>
                      <option value="0.1">0,1</option> 
                      <option value="100">100</option> 
                      <option value="1000">1.000</option> 
                      <option value="1000000">1.000.000</option> 
                      <option value="1000000000">1.000.000.000</option> 
                      <option value="1000000000000">1.000.000.000.000</option>                 
                    </select>
                  </div>
                  <button id="control-confirm" class="control-button">Confirmar</button>             
                </ul>
              </div>
            </div>
          </div>
        </div>
        <style>
          .grafico { display: flex; }
          .grafico-preview { height: 60%; }
          .view-container { display: flex; width: 100%; height: auto; }
          .view-container > h3 { margin-top: 15%; }
          .graph-input, .graph-select { max-width: 350px; min-width: 100%; padding: 10px; }
          .hidden { display: none; }
          .menudesplegable { display: none; }
          .insert-data-grafic.active { right: -600px; transition: right 0.3s ease; }
          .editor-header { position: relative; }
          #menu-mostrar {
            border-top-left-radius: 10%;
            border-bottom-left-radius: 10%;
            cursor: pointer;
            position: absolute;
            left: -52px;
            z-index: 5;
            width: 53px;
            height: 100%;
            border-style: none;
            color: #0b57d0;
            background-color: #e1e9f7;
            font-weight: 600;
          }
          .insert-data-grafic__container { width: 100%; display: flex; height: 100%; }
        </style>
      `;
    }

    addListeners() {
      const botonMostrar = this.querySelector("#menu-mostrar");
      botonMostrar.addEventListener("click", this.toggleMenu.bind(this));

      const tipoGrafico = this.querySelector("#tipoGrafico");
      tipoGrafico.addEventListener("change", this.updateOptions.bind(this));

      const controlConfirm = this.querySelector("#control-confirm");
      controlConfirm.addEventListener("click", this.createChart.bind(this));

      const selectEtiquetas = this.querySelector("#etiquetas-grafico");
      selectEtiquetas.addEventListener("change", () => {
        state.agregarEtiquetas(selectEtiquetas.value);
      });

      const selectEjex = this.querySelector("#ejeX");
      selectEjex.addEventListener("change", () => {
        state.agregarEjeX(selectEjex.value);
      });

      const selectSerie = this.querySelector("#serie");
      selectSerie.addEventListener("change", () => {
        state.agregarSerie(selectSerie.value);
      });
    }

    toggleMenu() {
      const insertData = this.querySelector(".insert-data-grafic");
      insertData.classList.toggle("active");
      const botonMostrar = this.querySelector("#menu-mostrar");
      botonMostrar.textContent =
        botonMostrar.textContent === "X" ? "Editar" : "X";
    }

    updateOptions() {
      const tipoGrafico = this.querySelector("#tipoGrafico");
      const contenedorOpciones1 = this.querySelector("#confi-torta");
      const contenedorOpciones2 = this.querySelector("#confi-barras");

      contenedorOpciones1.classList.toggle(
        "hidden",
        tipoGrafico.value !== "torta"
      );
      contenedorOpciones2.classList.toggle(
        "hidden",
        tipoGrafico.value !== "barras"
      );

      state.agregarTipoGrafico(tipoGrafico.value);
    }

    populateOptions() {
      const data = state.seleccion.datos;
      const newDf = new dfd.DataFrame(data);
      const columns = newDf.columns;

      const optionsHTML = columns
        .map((col) => `<option value=${col}>${col}</option>`)
        .join("");

      this.querySelector("#etiquetas-grafico").innerHTML = optionsHTML;
      this.querySelector("#ejeX").innerHTML = optionsHTML;
      this.querySelector("#serie").innerHTML = optionsHTML;
    }

    createChart() {
      const tipoGrafico = this.querySelector("#tipoGrafico").value;
      const contenedorGrafico = this.querySelector("#plot_div");
      const context = contenedorGrafico.getContext("2d");
      const data = state.seleccion.datos;

      const contenedorPresentacion = this.querySelector(
        "#presentacion-grafico"
      );
      contenedorPresentacion.style.display = "none";

      if (this.myChart) {
        this.myChart.destroy();
      }

      if (tipoGrafico === "torta") {
        this.createPieChart(context, data);
      } else if (tipoGrafico === "barras") {
        this.createBarChart(context, data);
      }
    }

    createPieChart(context, data) {
      const selectEtiquetas = this.querySelector("#etiquetas-grafico");
      const counts = data[selectEtiquetas.value].reduce((acc, pos) => {
        acc[pos] = (acc[pos] || 0) + 1;
        return acc;
      }, {});

      const labels = Object.keys(counts);
      const values = Object.values(counts);

      const tituloGrafico = this.querySelector("#titulo-grafico").value;
      const porcentajeAnillo =
        this.querySelector("#porcentaje-circulo").value || "0";

      this.myChart = new Chart(context, {
        type: "pie",
        data: {
          labels: labels,
          datasets: [{ data: values }],
        },
        options: {
          cutout: porcentajeAnillo + "%",
          plugins: {
            title: {
              display: true,
              text: tituloGrafico,
            },
          },
        },
      });
    }

    createBarChart(context, data) {
      const selectEjex = this.querySelector("#ejeX");
      const selectSerie = this.querySelector("#serie");

      const labels = data.map((item) => item[selectEjex.value]);
      const values = data.map((item) => item[selectSerie.value]);

      const tituloGrafico = this.querySelector("#titulo-grafico").value;
      const tituloEjeX = this.querySelector("#titulo-grafico-x").value;
      const tituloEjeY = this.querySelector("#titulo-grafico-y").value;
      const escala = this.querySelector("#escala").value;

      this.myChart = new Chart(context, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{ data: values }],
        },
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: tituloEjeX,
              },
            },
            y: {
              title: {
                display: true,
                text: tituloEjeY,
              },
              ticks: {
                callback: function (value) {
                  return value / escala;
                },
              },
            },
          },
          plugins: {
            title: {
              display: true,
              text: tituloGrafico,
            },
          },
        },
      });
    }
  }
);
