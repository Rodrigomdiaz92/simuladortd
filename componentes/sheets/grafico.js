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
                    <input class="graph-input" type="number" id="porcentaje-circulo">
                  </div>
                  <div id="confi-barras" class="hidden">              
                    <label>Eje X:</label>
                    <select class="graph-select" id="ejeX"></select>
                    <label style=" margin-left: 3.3%;">Serie:</label>
                    <select class="graph-select" id="serie"></select>
                    <label style="display: none;" style=" margin-left: 61%;">Función:</label>
                    <select style="display: none;" class="graph-select" id="funcion">
                      <option value="conteo">Conteo</option>
                      <option value="suma">Suma</option>
                      <option value="promedio">Promedio</option>
                      <option value="minimo">Mín.</option>
                      <option value="maximo">Máx.</option>
                    </select>
                    <h3>Personalizar</h3>               
                    <label>Titulo eje X</label>
                    <input class="graph-input" type="text" id="titulo-grafico-x">
                    <label>Titulo eje Y</label>
                    <input class="graph-input" type="text" id="titulo-grafico-y">
                    <label>Escala del Eje vertical</label>
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
          .graph-input, .graph-select { max-width: 91.6%; padding: 10px; margin-top: 8px; cursor: pointer; }
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
          #ejeX {
            margin-top: 1.6%;
          }
          #titulo-grafico-x{
            cursor: text;
          }
          #titulo-grafico-y{
            cursor: text;
          }
          #confi-torta label {
              display: block;
              margin-top: 10px
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
      tipoGrafico.addEventListener("change", () => {
        state.validarTipoGrafico(tipoGrafico.value);
      });

      const controlConfirm = this.querySelector("#control-confirm");
      controlConfirm.addEventListener("click", this.createChart.bind(this));

      const selectEtiquetas = this.querySelector("#etiquetas-grafico");
      selectEtiquetas.addEventListener("change", this.updateOptions.bind(this));
      selectEtiquetas.addEventListener("change", () => {
        state.validarEtiquetaGrafico(selectEtiquetas.value);
      });
      
      const huecoCirculo = this.querySelector("#porcentaje-circulo");
      huecoCirculo.addEventListener("change", this.updateOptions.bind(this));
      huecoCirculo.addEventListener("change", () => {
        state.validarHuecoCirculo(huecoCirculo.value);
      });

      //const selectEjex = this.querySelector("#ejeX");
      
      const selectEjex = this.querySelector("#ejeX");
      selectEjex.addEventListener("change", () => {
        state.agregarEjeX(selectEjex.value);
      });
      selectEjex.addEventListener("change", this.updateOptions.bind(this));
      selectEjex.addEventListener("change", () => {
        state.validarEjeXBarras(selectEjex.value);
      });

      /*const selectSerie = this.querySelector("#serie");
      selectSerie.addEventListener("change", () => {
        state.agregarSerie(selectSerie.value);
      });*/
      const selectSerie = this.querySelector("#serie");
      selectSerie.addEventListener("change", this.updateOptions.bind(this));
      selectSerie.addEventListener("change", () => {
        state.validarSerieBarras(selectSerie.value);
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

      const defaultOption = `<option value="none" selected>---</option>`;
      const optionsHTML = columns
        .map((col) => `<option value=${col}>${col}</option>`)
        .join("");

      const finalOptionsHTML = defaultOption + optionsHTML;

      this.querySelector("#etiquetas-grafico").innerHTML = finalOptionsHTML;
      this.querySelector("#ejeX").innerHTML = finalOptionsHTML;
      this.querySelector("#serie").innerHTML = finalOptionsHTML;
    }

    createChart() {
      const tipoGrafico = this.querySelector("#tipoGrafico").value;
      const contenedorGrafico = this.querySelector("#plot_div");
      const context = contenedorGrafico.getContext("2d");
      const data = state.seleccion.datos;
      //console.log(data)

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
      const selectEjex = this.querySelector("#ejeX").value;
      const selectSerie = this.querySelector("#serie").value;
      const selectFuncion = this.querySelector("#funcion").value;
      console.log(data)
      console.log(selectEjex)
      console.log(selectSerie)

      // Inicializar el objeto Agrupado
      const agrupado = {};

      // Iterar sobre los datos y construir el objeto Agrupado
      for (let i = 0; i < data[selectEjex].length; i++) {
        const ejeX = data[selectEjex][i];
        const sumaceldas = data[selectSerie][i];
        
        if (!agrupado[ejeX]) {
          agrupado[ejeX] = { count: 0, sumaCelda: 0, promedioCelda: 0, minCelda: Infinity, maxCelda: 0};
        }
        
        agrupado[ejeX].count++;
        agrupado[ejeX].sumaCelda += sumaceldas;
        if (sumaceldas < agrupado[ejeX].minCelda) agrupado[ejeX].minCelda = sumaceldas;
        if (sumaceldas > agrupado[ejeX].maxCelda) agrupado[ejeX].maxCelda = sumaceldas;
      }

      for (let habilidad in agrupado) {
        agrupado[habilidad].promedioCelda = agrupado[habilidad].sumaCelda / agrupado[habilidad].count;
      }

      // Obtener los valores únicos, los arrays de count y ratingSum
      const uniqueValues = Object.keys(agrupado);
      const countArray = uniqueValues.map(ejeX => agrupado[ejeX].count);
      const sumCeldaArray = uniqueValues.map(ejeX => agrupado[ejeX].sumaCelda);
      const ratingAvgArray = uniqueValues.map(ejeX => agrupado[ejeX].promedioCelda);
      const ratingMinArray = uniqueValues.map(habilidad => agrupado[habilidad].minCelda);
      const ratingMaxArray = uniqueValues.map(habilidad => agrupado[habilidad].maxCelda);

      console.log("Agrupado:", agrupado);
      console.log("Unique Values:", uniqueValues);
      console.log("Count Array:", countArray);
      console.log("Rating Sum Array:", sumCeldaArray);
      console.log("Rating Avg Array:", ratingAvgArray);
      console.log("Rating Min Array:", ratingMinArray);
      console.log("Rating Max Array:", ratingMaxArray);

      function isNumericArray(array) {
        return array.every(element => typeof element === 'number');
      }

      const isSerieNumeric = isNumericArray(data[selectSerie]);

      let dataset;

      if(isNumericArray(data[selectSerie])){
        if (selectFuncion =="suma") {
          dataset = sumCeldaArray;
        } /*else if (selectFuncion == "promedio") {
          dataset = ratingAvgArray;
        } else if (selectFuncion == "minimo") {
          dataset = ratingMinArray;
        } else if (selectFuncion == "maximo") {
          dataset = ratingMaxArray;
        }*/
      }else{
        dataset= countArray;
      }

      console.log("Is Serie Numeric:", isSerieNumeric);
      console.log(dataset);



      //const labels = data2.map((item) => item[selectEjex.value]);
      //const values = data2.map((item) => item[selectSerie.value]);
      //const labels= data[selectEjex.value];
      //const values=;

      const tituloGrafico = this.querySelector("#titulo-grafico").value;
      const tituloEjeX = this.querySelector("#titulo-grafico-x").value;
      const tituloEjeY = this.querySelector("#titulo-grafico-y").value;
      const escala = this.querySelector("#escala").value;

      this.myChart = new Chart(context, {
        type: "bar",
        data: {
          labels: uniqueValues,
          //datasets: [{ data: values }],
          datasets: [
            {
              label: selectSerie,
              //label: selectSerie.options[selectSerie.selectedIndex].text,
              //data: data[selectSerie.value],
              data: dataset,
            },
          ],
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
                beginAtZero: true,
                stepSize: parseFloat(escala), // configuracion de escala
              },
              /*ticks: {
                callback: function (value) {
                  return value / escala;
                },
              },*/
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
