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
    }
    addListeners() {
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


    

      
  
              `;
      this.appendChild(style);
      this.addListeners();
    }
  }
);
