import { state } from "../../state";
import { DataTable } from "../../clases/DataTable";
import Chart from "chart.js/auto";
customElements.define(
  "grafico-el",
  class HeaderElement extends HTMLElement {
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

      // Menu configuracion
      const botonMostrar = document.getElementById("menu-mostrar");
      botonMostrar.addEventListener("click", () => {
        const insertData = this.querySelector(".insert-data-grafic");
        insertData.classList.toggle("active");
        if (botonMostrar.textContent == "X") {
          botonMostrar.textContent = "Ver";
          return;
        }
        botonMostrar.textContent = "X";
      });

      // Identificador de boton para creacion de grafico
      const controlConfirm = document.getElementById("control-confirm");
      // Identificador para presentacion previa al grafico
      const contenedorPresentacion = document.getElementById(
        "presentacion-grafico"
      );
      //Selector de tipo de grafico
      const tipoGrafico = document.getElementById("tipoGrafico");
      //Contenedores de opciones de graficos
      const contenedorOpciones1 = document.getElementById("confi-torta");
      const contenedorOpciones2 = document.getElementById("confi-barras");
      // Identificador de canvas para grafico
      const contenedorGrafico = document.getElementById("plot_div");
      const context = document.getElementById("plot_div").getContext("2d");
      // Datos para grafico
      const data = state.seleccion.datos;
      // Selector de opciones de grafico
      tipoGrafico.addEventListener("change", function () {
        if (tipoGrafico.value === "torta") {
          contenedorOpciones1.classList.remove("hidden");
          contenedorOpciones2.classList.add("hidden");
        }
        if (tipoGrafico.value === "barras") {
          contenedorOpciones2.classList.remove("hidden");
          contenedorOpciones1.classList.add("hidden");
        }
      });
      //---

      // Busca elementos select
      let selectEtiquetas = document.getElementById("etiquetas-grafico");
      let selectValores = document.getElementById("valores-grafico");
      let selectEjex = document.getElementById("ejeX");
      let selectSerie = document.getElementById("serie");
      //Creacion de DF para obtener opciones a mostrar en las opciones
      const newDf = new dfd.DataFrame(state.seleccion.datos);
      const columns = newDf.columns;


      // Variables de de grafico para creacion o rediseño de grafico
      let myLineChart;
      let graficoCreado = false;

      //Creaccion de columnas y opciones para seleccion
      const opciones = columns
        .map((col) => `<option value=${col}>${col}</option>`)
        .join("");
      selectEtiquetas.innerHTML = "";
      selectValores.innerHTML = "";
      selectEjex.innerHTML = "";
      selectSerie.innerHTML = "";
      //Opciones para grafico de torta
      selectEtiquetas.innerHTML = opciones;
      selectValores.innerHTML = opciones;
      //Opciones para grafico de barras
      selectEjex.innerHTML = opciones;
      selectSerie.innerHTML = opciones;
      //Variable para crear titulos del grafico
      let tituloGrafico = " ";
      let tituloGraficoEjeY = " ";
      let tituloGraficoEjeX = " ";

      //Funcion para rediseñar y crear el grafico
      controlConfirm.addEventListener("click", function () {
        console.log(state.seleccion.datos);
        console.log(tipoGrafico.value);

        contenedorGrafico.innerHTML = " ";
        // Condicional para destruccion de grafico creado y su rediseño
        if (graficoCreado == true) {
          myLineChart.destroy();
          graficoCreado = false;
        }
        //Creaccion del grafico
        if (tipoGrafico.value == "torta") {
          contenedorPresentacion.innerHTML = "";
          // Capturar nuevo titulo ingresado y sumarlo a la variable de titulo
          let nuevoTitulo = document.getElementById("titulo-grafico").value;
          tituloGrafico = nuevoTitulo;
          //Capturar % de anillo, condicional para asignar el valor predeterminado
          let porcentajeAnillo =
            document.getElementById("porcentaje-circulo").value;
          if (porcentajeAnillo == "") {
            porcentajeAnillo = "0";
          }

          //Configurar opciones del grafico
          const config = {
            type: "pie",
            data: {
              labels: data[selectEtiquetas.value],
              datasets: [
                {
                  label:
                    selectValores.options[selectValores.selectedIndex].text,
                  data: data[selectValores.value],
                },
              ],
            },
            options: {
              cutout: porcentajeAnillo + "%", // Configuracion de grafico de anillo(hueco del círculo)
              plugins: {
                title: {
                  display: true,
                  text: tituloGrafico,
                },
                tooltip: {
                  callbacks: {
                    //Configuracion para mostrar porcentajes de porciones
                    label: function (context) {
                      var label = context.label || "";
                      var value = context.formattedValue;
                      var percentage = (
                        (context.parsed /
                          context.dataset.data.reduce((a, b) => a + b, 0)) *
                        100
                      ).toFixed(2);
                      return label + ": " + value + " (" + percentage + "%)";
                    },
                  },
                },
              },
            },
          };
          //Creaccion del grafico en canvas con la configuracion declarada
          myLineChart = new Chart(context, config);
          // Pasar variable a true para identificar que hay un grafico creado
          graficoCreado = true;
        } else {
          contenedorPresentacion.innerHTML = "";
          // Capturar nuevos titulos ingresado y sumarlo a la variable de los titulos
          let nuevoTitulo = document.getElementById("titulo-grafico").value;
          tituloGrafico = nuevoTitulo;
          let nuevoTituloEjeX =
            document.getElementById("titulo-grafico-x").value;
          tituloGraficoEjeX = nuevoTituloEjeX;
          let nuevoTituloEjeY =
            document.getElementById("titulo-grafico-y").value;
          tituloGraficoEjeY = nuevoTituloEjeY;
          let escalaEjeY = document.getElementById("escala").value;
          //Configurar opciones del grafico
          const config = {
            type: "bar",
            data: {
              labels: data[selectEjex.value],
              datasets: [
                {
                  label: selectSerie.options[selectSerie.selectedIndex].text,
                  data: data[selectSerie.value],
                },
              ],
            },
            options: {
              plugins: {
                title: {
                  display: true,
                  text: tituloGrafico,
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: tituloGraficoEjeX, //titulo eje X
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: tituloGraficoEjeY, // titulo de eje Y
                  },
                  ticks: {
                    beginAtZero: true,
                    stepSize: parseFloat(escalaEjeY), // configuracion de escala
                  },
                },
              },
            },
          };
          //Creaccion del grafico en canvas con la configuracion declarada
          myLineChart = new Chart(context, config);
          // Pasar variable a true para identificar que hay un grafico creado
          graficoCreado = true;
        }
      });
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
              <label>Etiquetas:</label>
              <select class="graph-select" id="etiquetas-grafico">                
              </select>
              <label>Valores:</label>
              <select class="graph-select" id="valores-grafico">                
              </select>
              <label>Hueco del círculo(%)</label>
              <input class="graph-input" type="number" id="porcentaje-circulo" placeholder="Predeterminado">
              </div>
              <div id="confi-barras" class="hidden">              
              <label>Eje X:</label>
              <select class="graph-select" id="ejeX">                
              </select>
              <label>Serie:</label>
              <select class="graph-select" id="serie">                
              </select>


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
            
            </div>
        </div>
      </div>
            `;
      const style = document.createElement("style");
      style.innerHTML = `
      .grafico{        
        display:flex;
      }
      .grafico-preview{
        height:60%;
      }
      .view-container{
        display:flex;
        width:100%;
        height:auto;
      }
      .view-container > h3{
        margin-top: 15%;
      }

      .graph-input, .graph-select{
        max-width:350px;
        min-width:100%;
        padding:10px;
      }
      .hidden {
        display: none;
    }

    .menudesplegable{
      display:none;
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
        dataset = sumCeldaArray;
        /*if (selectFuncion =="suma") {
          dataset = sumCeldaArray;
        } else if (selectFuncion == "promedio") {
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
    .insert-data-grafic.active{
      right:-600px;
      transition: right 0.3s ease;
    }
    .editor-header{
      position:relative;
    }
    #menu-mostrar{
      cursor:pointer;
      position: absolute;
      top: 2px;
      left: -37px;
      z-index: 5;
      width: 37px;
      height: 100%;
      border-style: none;
      color: #0b57d0;
      background-color: #e1e9f7;
      font-weight: 600;
    }
    .insert-data-grafic__container{
      width:100%;
      display:flex;
      height:100%;
    }

    

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

              `;
      this.appendChild(style);
      this.addListeners();

    }
  }
);
