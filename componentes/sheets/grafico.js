import Chart from "chart.js/auto";
import { state } from "../../state";
import { quitarAcentosYCaracteresEspeciales } from "@utils/text";

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
                    <div class="small-square">
                      <div class="small-square1"></div>
                      <div class="small-square2"></div>
                      <div class="small-square3"></div>
                      <div class="small-square4"></div>
                    </div>
                  </div>
                  <div class="control">
                    <input class="graph-input" type="text" id="titulo-grafico" placeholder="Ingresa aqui el titulo de tu grafico">
                    <label>Tipo de gráfico:</label>
                    <select class="graph-select" id="tipoGrafico">              
                      <option value="none">---</option>
                      <option value="torta">Gráfico de Torta</option>
                      <option value="barras">Gráfico de Barras</option>
                      <option value="histograma">Histograma</option>
                      <option value="dispersion">Dispersion</option>
                    </select>
                  </div>
                  <div id="confi-torta" class="hidden">              
                    <label>Etiqueta:</label>
                    <select class="graph-select" id="etiquetas-grafico"></select>
                    <label>Valor:</label>
                    <select class="graph-select" id="valor-grafico"></select> 
                    <label>Hueco del círculo(%)</label>
                    <input class="graph-input" type="number" id="porcentaje-circulo">
                  </div>
                  <div id="confi-histograma" class="hidden">              
                    <label>Valor:</label>
                    <select class="graph-select" id="valor-histograma"></select> 
                    <label>Tamaño de los Segmentos</label>
                    <input class="graph-input" type="number" id="tamaño-segmento">
                  </div>  
                  <div id="confi-barras" class="hidden">              
                    <label>Eje X:</label>
                    <select class="graph-select" id="ejeX"></select>                    
                    <div class="dropdown-toggle" id="dropdown-toggle" >
                        Seleccionar Series
                    </div>
                    <div id="dropdown-content" class="dropdown-content"></div>
                    <label for="graficoApilado" style=" margin-left: 290px;">Gráfico Apilado</label>
                    <input type="checkbox" id="graficoApilado">


                    <label style="display: none;" style=" margin-left: 61%;">Función:</label>
                    <select style="display: none;" class="graph-select" id="funcion">
                      <option value="conteo">Conteo</option>
                      <option value="suma">Suma</option>
                      <option value="promedio">Promedio</option>
                      <option value="minimo">Mín.</option>
                      <option value="maximo">Máx.</option>
                    </select>
                    <h3>Personalizar</h3> 
                    <div>              
                    <label>Titulo eje X</label>
                    <input class="graph-input" type="text" id="titulo-grafico-x">
                    </div>
                    <div>
                    <label>Titulo eje Y</label>
                    <input class="graph-input" type="text" id="titulo-grafico-y">
                    </div>
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

                  <div id="confi-dispersion" class="hidden">              
                    <label>Eje X:</label>
                    <select class="graph-select" id="ejeX-dispersion"></select>
                    <br>
                    <label>Serie</label>
                    <select class="graph-select" id="ejeY-dispersion"></select>
                    
                    <label for="lineaTendencia" style=" margin-left: 290px;">Linea de Tendencia</label>
                    <input type="checkbox" id="linea-tendencia"> 
                    <h3>Personalizar</h3> 
                    <div>              
                    <label>Titulo eje X</label>
                    <input class="graph-input" type="text" id="titulo-grafico-x">
                    </div>
                    <div>
                    <label>Titulo eje Y</label>
                    <input class="graph-input" type="text" id="titulo-grafico-y">
                    
                    </div>
                    
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
            margin-top: -1px
          }
          #ejeX {
            margin-top: 1.6%;
            max-width: 40%;
          }
          #titulo-grafico-x{
            cursor: text;
            width: 345px;
          }
          #titulo-grafico-y{
            cursor: text;
            width: 345px;
          }
          #confi-torta label {
              display: block;
              margin-top: 10px
          }
          #confi-histograma label {
              display: block;
              margin-top: 10px
          }

          #escala{
          width: 262px;
          }
          .insert-data-grafic__container { width: 100%; display: flex; height: 100%; }

          .small-square {
            width: 20px;
            height: 20px;
            margin-top: -35px;
            margin-left: 80%;
        }
          .small-square1 {
            width: 10px;
            height: 10px;
            border: solid 1px dimgrey;
            border-top: solid 3px dimgrey;
            border-left: solid 3px dimgrey;
        }
          .small-square2 {
            width: 10px;
            height: 10px;
            border: solid 1px dimgrey;
            border-bottom: solid 3px dimgrey;
            border-left: solid 3px dimgrey;
        }
          .small-square3 {
            width: 10px;
            height: 10px;
            border: solid 1px dimgrey;
            border-top: solid 3px dimgrey;
            border-right: solid 3px dimgrey;
            margin-top: -20px;
            margin-left: 10px;
        }
          .small-square4 {
            width: 10px;
            height: 10px;
            border: solid 1px dimgrey;
            margin-left: 10px;
            border-right: solid 3px dimgrey;
            border-bottom: solid 3px dimgrey;
        }
          #etiquetas-grafico, #valor-grafico, #porcentaje-circulo {
            border-radius: 10px;
            appearance: none;
            width: 100%;
        }
      

        
          
          /* Estilo para la opción "Mostrar opciones" NO BORRAR */

        .dropdown-toggle {
            border: solid 1px;
            border-radius: 10px;
            width: 180px;
            text-align: center;
            background-color: white;
            cursor: pointer;
            user-select: none;
            margin-left: 53%;
            margin-top: -30px;
            font-size: 18px;
        }

        .dropdown-content {
            display: none;
            background-color: #ffffff;
            margin-top: 10px;
            max-width: 300px;
            margin-left: 136px;
            text-align: right;
            border-radius: 10px;
            margin-top: 20px;

            
        }

        .dropdown-content.show {
            display: block;
        }

        .dropdown-content label {
            display: flex;
            align-items: center;
            padding: 5px 0;
            flex-direction: row-reverse;
        }

        .dropdown-content input[type="checkbox"] {
            appearance: none;
            width: 18px;
            height: 18px;
            border: 2px solid #757575;
            border-radius: 4px;
            margin-right: 10px;
            position: relative;
            cursor: pointer;
        }

        .dropdown-content input[type="checkbox"]:checked {
            background-color: #6200ea;
            border-color: #6200ea;
        }

        .dropdown-content input[type="checkbox"]:checked::before {
            content: '';
            position: absolute;
            top: 2px;
            left: 5px;
            width: 5px;
            height: 10px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
        }
        
        #graficoApilado{
            
            width: 18px;
            height: 18px;
            border: 2px solid #757575;
            border-radius: 4px;
            margin-right: 10px;
            position: relative;
            margin-top: 5px; 
        }




        /*Estilo para el menú desplegable */
        /*.dropdown-content {
            display: none;
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            border-radius: 4px;
            margin-top: 10px;
            padding: 10px;
            max-width: 200px;
        }

        .dropdown-content.show {
            display: block;
        }

        /* Estilo para los checkboxes del menú desplegable */
        .dropdown-content label {
            display: flex;
            align-items: center;
            padding: 5px 0;
        }

        .dropdown-content input[type="checkbox"] {
            appearance: none;
            width: 18px;
            height: 18px;
            border: 2px solid #757575;
            border-radius: 4px;
            margin-right: 10px;
            position: relative;
            cursor: pointer;
        }

        .dropdown-content input[type="checkbox"]:checked {
            background-color: #6200ea;
            border-color: #6200ea;
        }

        .dropdown-content input[type="checkbox"]:checked::before {
            content: '';
            position: absolute;
            top: 2px;
            left: 5px;
            width: 5px;
            height: 10px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
        } */

          
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

      // Boton confirm

      const controlConfirm = this.querySelector("#control-confirm");

      //validacion de graficos   Torta y barras
      controlConfirm.addEventListener("click", () => {
        const tipoGrafico = this.querySelector("#tipoGrafico").value;

        if (tipoGrafico == "torta") {
          // Crear el gráfico primero
          this.createChart();

          // Verificar que createChart haya creado el gráfico
          console.log("Gráfico creado");

          // Obtener los valores necesarios para la validación

          const valorColumna = this.querySelector("#etiquetas-grafico").value;
          const valorGrafico = this.querySelector("#valor-grafico").value;
          const valorHueco = this.querySelector("#porcentaje-circulo").value;

          //Escala

          // Llamar a la función de validación después de crear el gráfico
          state.graficoTortaCompletado(
            tipoGrafico,
            valorColumna,
            valorGrafico,
            valorHueco
          );
        } else if (tipoGrafico == "barras") {
          // Crear el gráfico primero
          this.createChart();

          // Verificar que createChart haya creado el gráfico
          console.log("Gráfico creado");

          // Obtener los valores necesarios para la validación
          const selectEjex = this.querySelector("#ejeX").value;
          //selectedOptions ARRAY CON LAS SERIES
          const checkbox = this.querySelector("#graficoApilado");
          const isChecked = checkbox.checked;
          const escalaBarras = this.querySelector("#escala");
          // Llamar a la función de validación después de crear el gráfico
          state.graficoBarrasCompletado(
            tipoGrafico,
            selectEjex,
            this.selectedOptions,
            isChecked
          );
        } else if(tipoGrafico == "histograma") { 
          this.createChart();

          // Verificar que createChart haya creado el gráfico
          console.log("Gráfico creado");   //proximo grafico
        
        } else if(tipoGrafico == "dispersion"){
          this.createChart();
        
        } /*else if(DISPERSION){    //proximo grafico
        
        }*/
        state.fueEjecutado();
      });

      const mostraSeries = this.querySelector("#dropdown-toggle");
      mostraSeries.addEventListener("click", this.toggleDropdown.bind(this));

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

      const valorGrafico = this.querySelector("#valor-grafico");
      valorGrafico.addEventListener("change", this.updateOptions.bind(this));
      valorGrafico.addEventListener("change", () => {
        state.validarValorGrafico(valorGrafico.value);
      });

      const valorHistograma = this.querySelector("#valor-histograma");
      valorHistograma.addEventListener("change", this.updateOptions.bind(this));
      valorHistograma.addEventListener("change", () => {
        state.validarvalorHistograma(valorHistograma.value);
      });

      const Segmento = this.querySelector("#tamaño-segmento");
      Segmento.addEventListener("change", this.updateOptions.bind(this));
      Segmento.addEventListener("change", () => {
        state.validarSegmento(Segmento.value);
      });

      const selectEjex = this.querySelector("#ejeX");
      selectEjex.addEventListener("change", this.updateOptions.bind(this));
      selectEjex.addEventListener("change", () => {
        state.validarEjeXBarras(selectEjex.value);
      });

      //Validacion Series barras
      this.selectedOptions = state.seleccionGraficos.seleccion.serie || [];
      const selectOptions = [];
      const series = this.querySelector("#dropdown-content");
      series.addEventListener("change", (event) => {
        const value = quitarAcentosYCaracteresEspeciales(event.target.value);
        const value1 = event.target.value;
        console.log(value);
        if (event.target.checked) {
          // Agregar la opción al array si se selecciona
          this.selectedOptions.push(value);
          selectOptions.push(value1);
        } else {
          // Eliminar la opción del array si se deselecciona
          const index = this.selectedOptions.indexOf(value);
          if (index > -1) {
            this.selectedOptions.splice(index, 1);
          }
          const index1 = selectOptions.indexOf(value1);
          if (index1 > -1) {
            selectOptions.splice(index1, 1);
          }
        }

        console.log(this.selectedOptions);
        state.validarSerieBarras(this.selectedOptions, selectOptions);
      });

      //apilado
      const checkbox = this.querySelector("#graficoApilado");
      checkbox.addEventListener("change", () => {
        state.validarApiladoBarras(checkbox.checked);
      });

      //Escala
      const escalaBarras = this.querySelector("#escala");
      escalaBarras.addEventListener("change", () => {
        state.validarEscalaBarras(escalaBarras.value);
      });
      const tituloGrafico = this.querySelector("#titulo-grafico");
      tituloGrafico.addEventListener("change", () => {
        state.cambiarTitulos({ grafico: tituloGrafico.value });
      });
      const tituloEjeX = this.querySelector("#titulo-grafico-x");
      tituloEjeX.addEventListener("change", () => {
        state.cambiarTitulos({ ejeX: tituloEjeX.value });
      });
      const tituloEjeY = this.querySelector("#titulo-grafico-y");
      tituloEjeY.addEventListener("change", () => {
        state.cambiarTitulos({ ejeY: tituloEjeY.value });
      });
    }

    toggleMenu() {
      const insertData = this.querySelector(".insert-data-grafic");
      insertData.classList.toggle("active");
      const botonMostrar = this.querySelector("#menu-mostrar");
      botonMostrar.textContent =
        botonMostrar.textContent === "X" ? "Editar" : "X";
    }

    toggleDropdown() {
      const dropdownContent = this.querySelector("#<dropdown-content>");
      dropdownContent.classList.toggle("show");
    }

    updateOptions() {
      const tipoGrafico = this.querySelector("#tipoGrafico");
      const contenedorOpciones1 = this.querySelector("#confi-torta");
      const contenedorOpciones2 = this.querySelector("#confi-barras");
      const contenedorOpciones3 = this.querySelector("#confi-histograma");
      const contenedorOpciones4 = this.querySelector("#confi-dispersion");

      contenedorOpciones1.classList.toggle(
        "hidden",
        tipoGrafico.value !== "torta"
      );
      contenedorOpciones2.classList.toggle(
        "hidden",
        tipoGrafico.value !== "barras"
      );
      contenedorOpciones3.classList.toggle(
        "hidden",
        tipoGrafico.value !== "histograma"
      );
      contenedorOpciones4.classList.toggle(
        "hidden",
        tipoGrafico.value !== "dispersion"
      );

      state.agregarTipoGrafico(tipoGrafico.value);
    }
    //Nuevo + series

    toggleDropdown() {
      const dropdownContent = this.querySelector("dropdown-content"); // ???
      dropdownContent.classList.toggle("show");
    }
    populateOptions() {
      const data = state.seleccion.datos;
      const newDf = new dfd.DataFrame(data);
      const columns = newDf.columns;

      const optionsHTML = columns // Todas las col
        .map((col) => `<option value=${col}>${col}</option>`)
        .join("");
      
      const numericColumns = columns.filter(col => {  //Filtrar numericos
        const sampleData = data[col]; 
        return Array.isArray(sampleData) && sampleData.every(value => typeof value === 'number' && !isNaN(value));
      });

      const optionsHTMLNumeric = numericColumns //Valores solo numericos
        .map((col) => `<option value="${col}">${col}</option>`)
        .join("");

      const defaultOptionValorGrafico = `<option value="none" selected>Agregar Valor</option>`;
      const defaultOptionEtiqueta = `<option value="none" selected>Agregar Etiqueta</option>`;
      const defaultOptionEjeX = `<option value="none" selected> --- </option>`;
       //histograma

      const defaultOptionValorHistograma = `<option value="none" selected>Agregar Valor</option>`;
      //const defaultOptionSerie = `<option value="none" selected>Agregar Serie</option>`; Linea de Tomi

      const finalOptionsHTMLEtiqueta = defaultOptionEtiqueta + optionsHTML;
      const finalOptionsHTMLValorGrafico =
        defaultOptionValorGrafico + optionsHTML;
      const finalOptionsHTMLEjeX = defaultOptionEjeX + optionsHTML;
      const finalOptionsHTMLValorHistograma = defaultOptionValorHistograma + optionsHTMLNumeric;
      
      this.querySelector("#etiquetas-grafico").innerHTML =
        finalOptionsHTMLEtiqueta;
      //this.querySelector("#ejeX").innerHTML = optionsHTML;
      this.querySelector("#ejeX").innerHTML = finalOptionsHTMLEjeX;
      //Dispersion
      this.querySelector("#ejeX-dispersion").innerHTML = finalOptionsHTMLEjeX;
      this.querySelector("#ejeY-dispersion").innerHTML = finalOptionsHTMLEjeX;
      /*this.querySelector("#serie").innerHTML = finalOptionsHTMLSerie; Linea de Tomi */
      // histograma
      this.querySelector("#valor-histograma").innerHTML =
      finalOptionsHTMLValorHistograma; 

      
      this.querySelector("#valor-grafico").innerHTML =
        finalOptionsHTMLValorGrafico;

      const serieOptionHTML = columns
        .map(
          (col) => `<label for="${col}">
                <input type="checkbox" id="${col}" name="opciones" value="${col}">
                ${col}
            </label>`
        )
        .join("");

      this.querySelector("#dropdown-content").innerHTML = serieOptionHTML;
    }

    toggleDropdown() {
      const dropdownContent = this.querySelector("#dropdown-content");
      dropdownContent.classList.toggle("show");
    }

    createChart() {
      //state.fueEjecutado();
      const tipoGrafico = this.querySelector("#tipoGrafico").value;
      console.log(tipoGrafico)
      const contenedorGrafico = this.querySelector("#plot_div");
      const context = contenedorGrafico.getContext("2d");
      const data = state.seleccion.datos;
      console.log(data);

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
      else if (tipoGrafico === "histograma") {
        this.createHistogram(context, data);
      }
      else if (tipoGrafico === "dispersion") {
        this.createDispersion(context, data);
      }
    }

    createPieChart(context, data) {
      const selectEtiquetas = this.querySelector("#etiquetas-grafico");
      const selectValorGrafico = this.querySelector("#valor-grafico");

      // Verificar si el valor seleccionado es una clave válida en `data`
      if (
        !data.hasOwnProperty(selectEtiquetas.value) ||
        !data.hasOwnProperty(selectValorGrafico.value)
      ) {
        console.error("Invalid column selected");
        return;
      }

      // Inicializar el objeto Agrupado
      const agrupado = {};

      // Iterar sobre los datos y construir el objeto Agrupado
      for (let i = 0; i < data[selectEtiquetas.value].length; i++) {
        const etiquetas = data[selectEtiquetas.value][i];
        const sumaceldasgrafico = data[selectValorGrafico.value][i];

        if (!agrupado[etiquetas]) {
          agrupado[etiquetas] = {
            count: 0,
            sumaCelda: 0,
            promedioCelda: 0,
            minCelda: Infinity,
            maxCelda: 0,
          };
        }

        agrupado[etiquetas].count++;
        agrupado[etiquetas].sumaCelda += sumaceldasgrafico;
        if (sumaceldasgrafico < agrupado[etiquetas].minCelda)
          agrupado[etiquetas].minCelda = sumaceldasgrafico;
        if (sumaceldasgrafico > agrupado[etiquetas].maxCelda)
          agrupado[etiquetas].maxCelda = sumaceldasgrafico;
      }

      for (let habilidad in agrupado) {
        agrupado[habilidad].promedioCelda =
          agrupado[habilidad].sumaCelda / agrupado[habilidad].count;
      }

      // Obtener los valores únicos, los arrays de count y ratingSum
      const uniqueValues = Object.keys(agrupado);
      const countArray = uniqueValues.map(
        (etiquetas) => agrupado[etiquetas].count
      );
      const sumCeldaArray = uniqueValues.map(
        (etiquetas) => agrupado[etiquetas].sumaCelda
      );
      const ratingAvgArray = uniqueValues.map(
        (etiquetas) => agrupado[etiquetas].promedioCelda
      );
      const ratingMinArray = uniqueValues.map(
        (habilidad) => agrupado[habilidad].minCelda
      );
      const ratingMaxArray = uniqueValues.map(
        (habilidad) => agrupado[habilidad].maxCelda
      );

      console.log("Agrupado:", agrupado);
      console.log("Unique Values:", uniqueValues);
      console.log("Count Array:", countArray);
      console.log("Rating Sum Array:", sumCeldaArray);
      console.log("Rating Avg Array:", ratingAvgArray);
      console.log("Rating Min Array:", ratingMinArray);
      console.log("Rating Max Array:", ratingMaxArray);

      function isNumericArray(array) {
        return array.every((element) => typeof element === "number");
      }

      const valorGraficoData = data[selectValorGrafico.value];

      // Verificar si `valorGraficoData` está definido
      if (valorGraficoData === undefined) {
        console.error("Data for selected value is undefined");
        return;
      }

      const isSerieNumeric = isNumericArray(valorGraficoData);

      let dataset;

      if (isSerieNumeric) {
        dataset = sumCeldaArray;
      } else {
        dataset = countArray;
      }

      console.log("Is Serie Numeric:", isSerieNumeric);
      console.log(dataset);

      const tituloGrafico = this.querySelector("#titulo-grafico").value;
      const porcentajeAnillo =
        this.querySelector("#porcentaje-circulo").value || "0";

      this.myChart = new Chart(context, {
        type: "pie",
        data: {
          labels: uniqueValues,
          datasets: [{ label: selectEtiquetas.value, data: dataset }],
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
      state.cambiarTitulos({ grafico: tituloGrafico });
    }

    createBarChart(context, data) {
      //Barras
      const selectEjex = this.querySelector("#ejeX").value;
      //const selectSerie = this.querySelector("#serie").value;
      const selectFuncion = this.querySelector("#funcion").value;
      //const serieBarras = this.querySelector("#serie").value;

      let colores = [
        "#ffdc76", // dh
        "#ff8d7a", // dh
        "#8383fd", // dh
        "#00cc7e", // dh
        "#FFA500", // Naranja
        "#800080", // Púrpura
        "#00FFFF", // Cian
        "#FFC0CB", // Rosa
        "#000000", // Negro
      ];

      //Nuevo + opciones Series
      const checkboxes = this.querySelectorAll(
        'input[name="opciones"]:checked'
      );
      const opcionesSeleccionadas = [];

      const checkbox = this.querySelector("#graficoApilado");
      const isChecked = checkbox.checked;
      console.log("apilado? : " + isChecked);

      checkboxes.forEach((checkbox) => {
        opcionesSeleccionadas.push(checkbox.value);
      });

      console.log(opcionesSeleccionadas);
      console.log(opcionesSeleccionadas.length);

      if (opcionesSeleccionadas.length > 1) {
        //if(true){
        if (isChecked) {
          // grafico + de una serie Apilado
          //if(false){ // grafico + de una serie Apilado
          console.log(data);
          console.log(selectEjex);
          const selectSerie = opcionesSeleccionadas;

          const barrasagrupadas = [];

          for (let j = 0; j < opcionesSeleccionadas.length; j++) {
            // Inicializar el objeto Agrupado
            let agrupado = {};
            // Iterar sobre los datos y construir el objeto Agrupado
            for (let i = 0; i < data[selectEjex].length; i++) {
              const ejeX = data[selectEjex][i];
              const sumaceldas = data[selectSerie[j]][i];

              if (!agrupado[ejeX]) {
                agrupado[ejeX] = {
                  count: 0,
                  sumaCelda: 0,
                  promedioCelda: 0,
                  minCelda: Infinity,
                  maxCelda: 0,
                };
              }

              agrupado[ejeX].count++;
              agrupado[ejeX].sumaCelda += sumaceldas;
              if (sumaceldas < agrupado[ejeX].minCelda)
                agrupado[ejeX].minCelda = sumaceldas;
              if (sumaceldas > agrupado[ejeX].maxCelda)
                agrupado[ejeX].maxCelda = sumaceldas;
            }
            for (let habilidad in agrupado) {
              agrupado[habilidad].promedioCelda =
                agrupado[habilidad].sumaCelda / agrupado[habilidad].count;
            }
            barrasagrupadas.push(agrupado);
          }
          console.log(barrasagrupadas);
          const datasetApilado = [];
          let valores;

          for (let j = 0; j < opcionesSeleccionadas.length; j++) {
            console.log(opcionesSeleccionadas[j]);
            // Obtener los valores únicos, los arrays de count y ratingSum
            valores = Object.keys(barrasagrupadas[j]);
            const countArray = valores.map(
              (ejeX) => barrasagrupadas[j][ejeX].count
            );
            const sumCeldaArray = valores.map(
              (ejeX) => barrasagrupadas[j][ejeX].sumaCelda
            );
            const ratingAvgArray = valores.map(
              (ejeX) => barrasagrupadas[j][ejeX].promedioCelda
            );
            const ratingMinArray = valores.map(
              (habilidad) => barrasagrupadas[j][habilidad].minCelda
            );
            const ratingMaxArray = valores.map(
              (habilidad) => barrasagrupadas[j][habilidad].maxCelda
            );

            console.log("Agrupado:", barrasagrupadas[j]);
            console.log("Unique Values:", valores);
            console.log("Count Array:", countArray);
            console.log("Sum Array:", sumCeldaArray);
            console.log("Avg Array:", ratingAvgArray);
            console.log("Min Array:", ratingMinArray);
            console.log(" Max Array:", ratingMaxArray);

            function isNumericArray(array) {
              return array.every((element) => typeof element === "number");
            }

            const isSerieNumeric = isNumericArray(data[selectSerie[j]]);

            let dataset = [];

            if (isNumericArray(data[selectSerie[j]])) {
              dataset = sumCeldaArray;
              /*if (selectFuncion =="suma") { // no borrar, futura funcion para Looker
              dataset = sumCeldaArray;
            } else if (selectFuncion == "promedio") {
              dataset = ratingAvgArray;
            } else if (selectFuncion == "minimo") {
              dataset = ratingMinArray;
            } else if (selectFuncion == "maximo") {
              dataset = ratingMaxArray;
            }*/
            } else {
              dataset = countArray;
            }
            //Apiladas

            //for (let i = 0; i < opcionesSeleccionadas.length; i++){

            let aux = {
              //label: uniqueValues[i],
              label: opcionesSeleccionadas[j],
              backgroundColor: colores[j],
              data: dataset,
            };
            datasetApilado.push(aux);
            //}
          }

          //console.log("Is Serie Numeric:", isSerieNumeric);
          console.log(datasetApilado);

          const tituloGrafico = this.querySelector("#titulo-grafico").value;
          const tituloEjeX = this.querySelector("#titulo-grafico-x").value;
          const tituloEjeY = this.querySelector("#titulo-grafico-y").value;
          const escala = this.querySelector("#escala").value;

          this.myChart = new Chart(context, {
            type: "bar",
            data: {
              labels: valores,
              //labels: " ",
              datasets: datasetApilado,
              /*datasets: [
                {
                  label: selectSerie,
                  data: dataset,
                },
              ],*/
            },
            options: {
              scales: {
                x: {
                  stacked: true,
                  title: {
                    display: true,
                    text: tituloEjeX,
                  },
                },
                y: {
                  stacked: true,
                  title: {
                    display: true,
                    text: tituloEjeY,
                  },
                  beginAtZero: true,
                  ticks: {
                    //beginAtZero: true,
                    //stepSize: parseFloat(escala),
                    callback: function (value) {
                      return value.toLocaleString(); // Para formatear los números con comas
                    }, // configuracion de escala
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
        } else {
          //grafico + de una serie agrupado
          console.log(data);
          console.log(selectEjex);
          const selectSerie = opcionesSeleccionadas;

          const barrasagrupadas = [];

          for (let j = 0; j < opcionesSeleccionadas.length; j++) {
            // Inicializar el objeto Agrupado
            let agrupado = {};
            // Iterar sobre los datos y construir el objeto Agrupado
            for (let i = 0; i < data[selectEjex].length; i++) {
              const ejeX = data[selectEjex][i];
              const sumaceldas = data[selectSerie[j]][i];

              if (!agrupado[ejeX]) {
                agrupado[ejeX] = {
                  count: 0,
                  sumaCelda: 0,
                  promedioCelda: 0,
                  minCelda: Infinity,
                  maxCelda: 0,
                };
              }

              agrupado[ejeX].count++;
              agrupado[ejeX].sumaCelda += sumaceldas;
              if (sumaceldas < agrupado[ejeX].minCelda)
                agrupado[ejeX].minCelda = sumaceldas;
              if (sumaceldas > agrupado[ejeX].maxCelda)
                agrupado[ejeX].maxCelda = sumaceldas;
            }
            for (let habilidad in agrupado) {
              agrupado[habilidad].promedioCelda =
                agrupado[habilidad].sumaCelda / agrupado[habilidad].count;
            }
            barrasagrupadas.push(agrupado);
          }
          console.log(barrasagrupadas);
          const datasetApilado = [];
          let valores;

          for (let j = 0; j < opcionesSeleccionadas.length; j++) {
            console.log(opcionesSeleccionadas[j]);
            // Obtener los valores únicos, los arrays de count y ratingSum
            valores = Object.keys(barrasagrupadas[j]);
            const countArray = valores.map(
              (ejeX) => barrasagrupadas[j][ejeX].count
            );
            const sumCeldaArray = valores.map(
              (ejeX) => barrasagrupadas[j][ejeX].sumaCelda
            );
            const ratingAvgArray = valores.map(
              (ejeX) => barrasagrupadas[j][ejeX].promedioCelda
            );
            const ratingMinArray = valores.map(
              (habilidad) => barrasagrupadas[j][habilidad].minCelda
            );
            const ratingMaxArray = valores.map(
              (habilidad) => barrasagrupadas[j][habilidad].maxCelda
            );

            console.log("Agrupado:", barrasagrupadas[j]);
            console.log("Unique Values:", valores);
            console.log("Count Array:", countArray);
            console.log("Sum Array:", sumCeldaArray);
            console.log("Avg Array:", ratingAvgArray);
            console.log("Min Array:", ratingMinArray);
            console.log(" Max Array:", ratingMaxArray);

            function isNumericArray(array) {
              return array.every((element) => typeof element === "number");
            }

            const isSerieNumeric = isNumericArray(data[selectSerie[j]]);

            let dataset = [];

            if (isNumericArray(data[selectSerie[j]])) {
              dataset = sumCeldaArray;
              /*if (selectFuncion =="suma") { // no borrar, futura funcion para Looker
              dataset = sumCeldaArray;
            } else if (selectFuncion == "promedio") {
              dataset = ratingAvgArray;
            } else if (selectFuncion == "minimo") {
              dataset = ratingMinArray;
            } else if (selectFuncion == "maximo") {
              dataset = ratingMaxArray;
            }*/
            } else {
              dataset = countArray;
            }
            //Apiladas

            //for (let i = 0; i < opcionesSeleccionadas.length; i++){

            let aux = {
              //label: uniqueValues[i],
              label: opcionesSeleccionadas[j],
              backgroundColor: colores[j],
              data: dataset,
            };
            datasetApilado.push(aux);
            //}
          }

          //console.log("Is Serie Numeric:", isSerieNumeric);
          console.log(datasetApilado);

          const tituloGrafico = this.querySelector("#titulo-grafico").value;
          const tituloEjeX = this.querySelector("#titulo-grafico-x").value;
          const tituloEjeY = this.querySelector("#titulo-grafico-y").value;
          const escala = this.querySelector("#escala").value;

          this.myChart = new Chart(context, {
            type: "bar",
            data: {
              labels: valores,
              //labels: " ",
              datasets: datasetApilado,
              /*datasets: [
                {
                  label: selectSerie,
                  data: dataset,
                },
              ],*/
            },
            options: {
              scales: {
                x: {
                  //stacked: true,
                  title: {
                    display: true,
                    text: tituloEjeX,
                  },
                },
                y: {
                  //stacked: true,
                  title: {
                    display: true,
                    text: tituloEjeY,
                  },
                  beginAtZero: true,
                  ticks: {
                    //beginAtZero: true,
                    //stepSize: parseFloat(escala),
                    callback: function (value) {
                      return value.toLocaleString(); // Para formatear los números con comas
                    }, // configuracion de escala
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
      } else {
        //grafico simple
        console.log(data);
        console.log(selectEjex);
        const selectSerie = opcionesSeleccionadas[0];
        console.log(opcionesSeleccionadas[0]);

        // Inicializar el objeto Agrupado
        const agrupado = {};

        // Iterar sobre los datos y construir el objeto Agrupado
        for (let i = 0; i < data[selectEjex].length; i++) {
          const ejeX = data[selectEjex][i];
          const sumaceldas = data[selectSerie][i];

          if (!agrupado[ejeX]) {
            agrupado[ejeX] = {
              count: 0,
              sumaCelda: 0,
              promedioCelda: 0,
              minCelda: Infinity,
              maxCelda: 0,
            };
          }

          agrupado[ejeX].count++;
          agrupado[ejeX].sumaCelda += sumaceldas;
          if (sumaceldas < agrupado[ejeX].minCelda)
            agrupado[ejeX].minCelda = sumaceldas;
          if (sumaceldas > agrupado[ejeX].maxCelda)
            agrupado[ejeX].maxCelda = sumaceldas;
        }

        for (let habilidad in agrupado) {
          agrupado[habilidad].promedioCelda =
            agrupado[habilidad].sumaCelda / agrupado[habilidad].count;
        }

        // Obtener los valores únicos, los arrays de count y ratingSum
        const uniqueValues = Object.keys(agrupado);
        const countArray = uniqueValues.map((ejeX) => agrupado[ejeX].count);
        const sumCeldaArray = uniqueValues.map(
          (ejeX) => agrupado[ejeX].sumaCelda
        );
        const ratingAvgArray = uniqueValues.map(
          (ejeX) => agrupado[ejeX].promedioCelda
        );
        const ratingMinArray = uniqueValues.map(
          (habilidad) => agrupado[habilidad].minCelda
        );
        const ratingMaxArray = uniqueValues.map(
          (habilidad) => agrupado[habilidad].maxCelda
        );

        console.log("Agrupado:", agrupado);
        console.log("Unique Values:", uniqueValues);
        console.log("Count Array:", countArray);
        console.log("Sum Array:", sumCeldaArray);
        console.log("Avg Array:", ratingAvgArray);
        console.log("Min Array:", ratingMinArray);
        console.log(" Max Array:", ratingMaxArray);

        function isNumericArray(array) {
          return array.every((element) => typeof element === "number");
        }

        const isSerieNumeric = isNumericArray(data[selectSerie]);

        let dataset = [];

        if (isNumericArray(data[selectSerie])) {
          dataset = sumCeldaArray;
          /*if (selectFuncion =="suma") { // no borrar, futura funcion para Looker
          dataset = sumCeldaArray;
        } else if (selectFuncion == "promedio") {
          dataset = ratingAvgArray;
        } else if (selectFuncion == "minimo") {
          dataset = ratingMinArray;
        } else if (selectFuncion == "maximo") {
          dataset = ratingMaxArray;
        }*/
        } else {
          dataset = countArray;
        }
        //Apiladas
        const datasetApilado = [];
        if (true) {
          for (let i = 0; i < opcionesSeleccionadas.length; i++) {
            let aux = {
              label: opcionesSeleccionadas[i],
              backgroundColor: colores[i],
              data: [dataset[i]],
            };
            datasetApilado.push(aux);
          }
        }

        console.log("Is Serie Numeric:", isSerieNumeric);
        console.log(dataset);

        const tituloGrafico = this.querySelector("#titulo-grafico").value;
        const tituloEjeX = this.querySelector("#titulo-grafico-x").value;
        const tituloEjeY = this.querySelector("#titulo-grafico-y").value;
        const escala = this.querySelector("#escala").value;

        this.myChart = new Chart(context, {
          type: "bar",
          data: {
            labels: uniqueValues,
            datasets: [
              {
                label: selectSerie,
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
                beginAtZero: true,
                ticks: {
                  beginAtZero: true,
                  stepSize: parseFloat(escala),
                  callback: function (value) {
                    return value.toLocaleString(); // Para formatear los números con comas
                  }, // configuracion de escala
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

    
    // Histograma
    // Definir la función isNumericArray
    isNumericArray(arr) {
      return Array.isArray(arr) && arr.every(value => typeof value === 'number' && !isNaN(value));
    }
  
    // Método para crear un histograma
    createHistogram(context, data) {
      const selectValorHistograma = this.querySelector("#valor-histograma");
      console.log("selectValorHistograma:", selectValorHistograma);
      const selectSegmento = this.querySelector("#tamaño-segmento");
      console.log("selectTamañoSegmento:", selectSegmento);
      
  
      if (!selectValorHistograma) {
        console.error("Elemento con id 'valor-histograma' no encontrado");
        return;
      }
  
      const selectedValue = selectValorHistograma.value;
      if (!data.hasOwnProperty(selectedValue)) {
        console.error("Invalid column selected");
        return;
      }
  
      const valorGraficoData = data[selectedValue];
      const Segmento = parseFloat(selectSegmento.value);

      if (isNaN(Segmento) || Segmento <= 0) {
        window.tabEl.handleChat(`El tamaño del segmento debe ser un número positivo mayor que cero.`, "error");
        return false;
      }


      if (!this.isNumericArray(valorGraficoData)) {
        window.tabEl.handleChat(`La columna seleccionada debe ser numerica.`, "error");
        return;
      }
  
      // const minValue = Math.min(...valorGraficoData);
      const minValue = 0;
      const maxValue = Math.max(...valorGraficoData);
      
      const minSegmento = maxValue * 0.1; // Minimo Tamaño de segmentos = 10% del maxValue
      if (tamañoSegmento < minSegmento) {
        window.tabEl.handleChat(`El tamaño del segmento debe ser mas alto.`, "error");
        return;
      }
     
      // Ajustar el número de bins y el ancho del bin según el tamaño del segmento seleccionado
      const numBins = Math.ceil((maxValue - minValue) / minSegmento);
      const bins = Array(numBins).fill(0);

      valorGraficoData.forEach((value) => {
        const binIndex = Math.min(Math.floor((value - minValue) / tamañoSegmento), numBins - 1);
        bins[binIndex]++;
      });
  
      const binLabels = Array.from({ length: numBins }, (_, i) => {
        const lowerBound = minValue + i * tamañoSegmento;
        const upperBound = lowerBound + tamañoSegmento;
        return `${lowerBound.toLocaleString()} - ${upperBound.toLocaleString()}`;
      });
  
      const tituloGrafico = "Histograma"; // Asignar un valor de título por defecto
  
      this.myChart = new Chart(context, {
        type: "bar",
        data: {
          labels: binLabels,
          datasets: [{
            label: selectedValue,
            data: bins,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            x: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Intervalos'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Frecuencia'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: tituloGrafico,
            },
          },
        }
      });
  
      state.cambiarTitulos({ grafico: tituloGrafico });
    }

    
  
    createDispersion(context, data) {
      const selectEjeXDispersion = this.querySelector("#ejeX-dispersion").value;
      //console.log("selectEjeXDispersion:", selectEjeXDispersion);
      const selectEjeYDispersion = this.querySelector("#ejeY-dispersion").value;
      //console.log("selectEjeYDispersion:", selectEjeYDispersion);
      const tituloGrafico = this.querySelector("#titulo-grafico").value;
      //const tituloEjeX = this.querySelector("#titulo-grafico-x").value;
      //const tituloEjeY = this.querySelector("#titulo-grafico-y").value;
      const checkbox = this.querySelector("#linea-tendencia");
      const isChecked = checkbox.checked;
          
      
      console.log(data)
      let dataEjeX= data[selectEjeXDispersion];
      let dataEjeY=data[selectEjeYDispersion];

      const datosDispersion=[]

      for (let i = 0; i < dataEjeX.length; i++) {
        let obj= {x:dataEjeX[i], y:dataEjeY[i]}
        datosDispersion.push(obj)
        
    }
    console.log(datosDispersion)

    let colores = [
      "#ffdc76", // dh
      "#ff8d7a", // dh
      "#8383fd", // dh
      "#00cc7e", // dh
      "#FFA500", // Naranja
      "#800080", // Púrpura
      "#00FFFF", // Cian
      "#FFC0CB", // Rosa
      "#000000", // Negro
    ];

    let datos;

    function calcularLineaTendencia(data) {
      const n = data.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

      for (let i = 0; i < n; i++) {
          sumX += data[i].x;
          sumY += data[i].y;
          sumXY += data[i].x * data[i].y;
          sumX2 += data[i].x * data[i].x;
      }

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      return data.map(point => {
          return { x: point.x, y: slope * point.x + intercept };
      });
  }

    if(isChecked){
      let trendlineData = calcularLineaTendencia(datosDispersion);

      datos= [{
        label: "Datos",
        data: datosDispersion,
        backgroundColor: colores[0],
        borderColor: colores[1],
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Línea de Tendencia',
        data: trendlineData,
        type: 'line',
        fill: false,
        borderColor: colores[2],
        borderWidth: 2,
        pointRadius: 0,
    }
    ];

    }else{

      datos= [{
        label: "Datos",
        data: datosDispersion,
        backgroundColor: colores[0],
        borderColor: colores[1],
        pointRadius: 5,
        pointHoverRadius: 7,
      }]

    }




    this.myChart = new Chart(context, {
      type: 'scatter',
      data: {
        labels: " ",
        datasets: datos
      },
      options: {
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
                display: true,
                text: selectEjeXDispersion
            }
        },
          y: {
            title: {
                display: true,
                text: selectEjeYDispersion
            }
        }
        },
        plugins: {
          title: {
            display: true,
            text: tituloGrafico,
          },
        },
      }
    });


    }
  })