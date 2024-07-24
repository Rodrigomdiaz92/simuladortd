import { appController } from "./appController";
import { pgEvent } from "./utils/pgEvent";

export const state = {
  firstChangeMade: false,
  ultimaVariableAgregada: "",
  timer: false,
  editingBlocked: false,
  seleccionTablaDinamica: {
    filas: [],
    columnas: [],
    valores: [],
    funcion: "",
    ejercicioCompletado: false,
  },
  seleccionGraficos: {
    seleccion: {
      tipoGrafico: "",
      ejeX: "",
      ejeY: "",
      etiqueta: "",
      huecoCirculo: "",
    },
    intervalo: {},
    datos: [],
  },
  handleFirstChangeMade() {
    if (!this.firstChangeMade) {
      this.firstChangeMade = true;
      this.seleccionTablaDinamica.ejercicioCompletado = false;
      appController.userSettings.settings.firstChangeMade =
        this.firstChangeMade;
      pgEvent.postEvent("FAILURE", "", [], "");
    }
  },
  tdListener: () => {},
  actualizarSeleccion(nuevaSeleccion) {
    this.seleccion = nuevaSeleccion;
    appController.userSettings.settings.intervalo = nuevaSeleccion.intervalo;
  },
  filaSeleccionadaTD(nuevaSeleccion) {
    this.timer = true;
    this.editingBlocked = true;
    this.actualizarIntervaloYRenderizar();
    this.actualizarReloj();
    if (state.seleccionTablaDinamica.ejercicioCompletado) return;
    this.seleccionTablaDinamica.filas.push(nuevaSeleccion);
    appController.userSettings.settings.filas =
      this.seleccionTablaDinamica.filas;
  },
  ordenarFilasSeleccionadasTD(nuevoOrdenFilas) {
    if (state.seleccionTablaDinamica.ejercicioCompletado) return;
    this.seleccionTablaDinamica.filas = nuevoOrdenFilas;
    appController.userSettings.settings.filas =
      this.seleccionTablaDinamica.filas;

    // Verifica si las filas recomendadas están vacías
    if (appController.app.baseSettings.filaSeleccionadaTD.length === 0) {
      this.handleFirstChangeMade();
      window.tabEl.handleChat(
        `No se recomienda seleccionar ninguna fila.`,
        "error"
      );
      return;
    }

    // Verifica si las filas seleccionadas son las recomendadas
    let filasCorrectasSeleccionadas = this.seleccionTablaDinamica.filas.filter(
      (fila) => appController.app.baseSettings.filaSeleccionadaTD.includes(fila)
    );
    let cantidadCorrecta =
      this.seleccionTablaDinamica.filas.length ===
      appController.app.baseSettings.filaSeleccionadaTD.length;
    if (
      filasCorrectasSeleccionadas.length ===
      appController.app.baseSettings.filaSeleccionadaTD.length
    ) {
      // Verifica si el orden de las filas seleccionadas es el mismo que el especificado en baseSettings
      let ordenCorrecto =
        JSON.stringify(this.seleccionTablaDinamica.filas) ===
        JSON.stringify(appController.app.baseSettings.filaSeleccionadaTD);

      if (ordenCorrecto && cantidadCorrecta) {
        if (this.seleccionTablaDinamica.filas.length > 1) {
          window.tabEl.handleChat(
            `Las filas seleccionadas y su orden son correctas.`,
            "correct"
          );
          this.verificarSeleccion();
        } else {
          window.tabEl.handleChat(
            `La fila seleccionada "${filasCorrectasSeleccionadas[0]}" es correcta.`,
            "true"
          );
          this.verificarSeleccion();
        }
      } else if (!cantidadCorrecta) {
        this.handleFirstChangeMade();
        window.tabEl.handleChat(
          `El número de filas seleccionadas no es correcto. Por favor, verifica tus selecciones.`,
          "error"
        );
      } else {
        window.tabEl.handleChat(
          `Las filas seleccionadas son correctas, pero el orden no es correcto. Por favor, verifica el orden de tus selecciones.`,
          "warning"
        );
      }
    } else if (
      filasCorrectasSeleccionadas.length > 0 &&
      filasCorrectasSeleccionadas.length <
        appController.app.baseSettings.filaSeleccionadaTD.length
    ) {
      // Encuentra las filas incorrectas
      let filasIncorrectas = this.seleccionTablaDinamica.filas.filter(
        (fila) =>
          !appController.app.baseSettings.filaSeleccionadaTD.includes(fila)
      );

      if (filasIncorrectas.length > 0) {
        // Muestra un mensaje con las filas incorrectas
        window.tabEl.handleChat(
          `La fila "${filasIncorrectas.join(", ")}" es incorrecta.`,
          "error"
        );
      } else {
        window.tabEl.handleChat(
          `La fila seleccionada "${filasCorrectasSeleccionadas.join(
            ", "
          )}" es correcta, pero faltan más filas.`,
          "warning"
        );
      }
    } else if (
      this.seleccionTablaDinamica.filas.length >
      appController.app.baseSettings.filaSeleccionadaTD.length
    ) {
      // Encuentra las filas innecesarias
      let filasInnecesarias = this.seleccionTablaDinamica.filas.filter(
        (fila) =>
          !appController.app.baseSettings.filaSeleccionadaTD.includes(fila)
      );
      this.handleFirstChangeMade();
      // Muestra un mensaje con las filas innecesarias
      window.tabEl.handleChat(
        `Ya has seleccionado todas las filas necesarias. La fila "${filasInnecesarias.join(
          ", "
        )}" no es necesaria.`,
        "error"
      );
    } else {
      this.handleFirstChangeMade();
      window.tabEl.handleChat(
        `Las filas seleccionadas no son correctas. Por favor, prueba con otras filas.`,
        "error"
      );
    }
  },
  columnaSeleccionadaTD(nuevaSeleccion) {
    this.timer = true;
    this.editingBlocked = true;
    this.actualizarIntervaloYRenderizar();
    this.actualizarReloj();
    if (state.seleccionTablaDinamica.ejercicioCompletado) return;
    this.seleccionTablaDinamica.columnas.push(nuevaSeleccion);
    appController.userSettings.settings.columnas =
      this.seleccionTablaDinamica.columnas;
  },
  ordenarColumnasSeleccionadasTD(nuevoOrdenColumnas) {
    if (state.seleccionTablaDinamica.ejercicioCompletado) return;
    this.seleccionTablaDinamica.columnas = nuevoOrdenColumnas;
    appController.userSettings.settings.columnas =
      this.seleccionTablaDinamica.columnas;

    // Verifica si las columnas recomendadas están vacías
    if (appController.app.baseSettings.columnaSeleccionadaTD.length === 0) {
      this.handleFirstChangeMade();
      window.tabEl.handleChat(
        `No se recomienda seleccionar ninguna columna.`,
        "error"
      );
      return;
    }

    let columnasCorrectasSeleccionadas =
      this.seleccionTablaDinamica.columnas.filter((columna) =>
        appController.app.baseSettings.columnaSeleccionadaTD.includes(columna)
      );

    let ordenCorrecto =
      JSON.stringify(this.seleccionTablaDinamica.columnas) ===
      JSON.stringify(appController.app.baseSettings.columnaSeleccionadaTD);
    let cantidadCorrecta =
      this.seleccionTablaDinamica.columnas.length ===
      appController.app.baseSettings.columnaSeleccionadaTD.length;

    if (
      columnasCorrectasSeleccionadas.length ===
      appController.app.baseSettings.columnaSeleccionadaTD.length
    ) {
      if (ordenCorrecto && cantidadCorrecta) {
        if (this.seleccionTablaDinamica.columnas.length > 1) {
          window.tabEl.handleChat(
            `Las columnas seleccionadas y su orden son correctas.`,
            "correct"
          );
          this.verificarSeleccion();
        } else {
          window.tabEl.handleChat(
            `La columna seleccionada "${columnasCorrectasSeleccionadas[0]}" es correcta.`,
            "correct"
          );
          this.verificarSeleccion();
        }
      } else if (!cantidadCorrecta) {
        this.handleFirstChangeMade();
        window.tabEl.handleChat(
          `El número de columnas seleccionadas no es correcto. Por favor, verifica tus selecciones.`,
          "error"
        );
      } else {
        window.tabEl.handleChat(
          `Las columnas seleccionadas son correctas, pero el orden no es correcto. Por favor, verifica el orden de tus selecciones.`,
          "warning"
        );
      }
    } else if (
      columnasCorrectasSeleccionadas.length > 0 &&
      columnasCorrectasSeleccionadas.length <
        appController.app.baseSettings.columnaSeleccionadaTD.length
    ) {
      // Encuentra las columnas incorrectas
      let columnasIncorrectas = this.seleccionTablaDinamica.columnas.filter(
        (columna) =>
          !appController.app.baseSettings.columnaSeleccionadaTD.includes(
            columna
          )
      );

      if (columnasIncorrectas.length > 0) {
        // Muestra un mensaje con las columnas incorrectas
        window.tabEl.handleChat(
          `La columna "${columnasIncorrectas.join(", ")}" es incorrecta.`,
          "error"
        );
      } else {
        window.tabEl.handleChat(
          `La columna seleccionada "${columnasCorrectasSeleccionadas.join(
            ", "
          )}" es correcta, pero faltan más columnas.`,
          "warning"
        );
      }
    } else if (
      this.seleccionTablaDinamica.columnas.length >
      appController.app.baseSettings.columnaSeleccionadaTD.length
    ) {
      // Encuentra las columnas innecesarias
      let columnasInnecesarias = this.seleccionTablaDinamica.columnas.filter(
        (columna) =>
          !appController.app.baseSettings.columnaSeleccionadaTD.includes(
            columna
          )
      );

      // Muestra un mensaje con las columnas innecesarias
      this.handleFirstChangeMade();
      window.tabEl.handleChat(
        `Ya has seleccionado todas las columnas necesarias. La columna "${columnasInnecesarias.join(
          ", "
        )}" no es necesaria.`,
        "error"
      );
    } else {
      this.handleFirstChangeMade();
      window.tabEl.handleChat(
        `Las columnas seleccionadas no son correctas. Por favor, prueba con otras columnas.`,
        "error"
      );
    }
  },
  valoresSeleccionadaTD(nuevaSeleccion, valor) {
    this.timer = true;
    this.editingBlocked = true;
    this.actualizarIntervaloYRenderizar();
    this.actualizarReloj();
    if (state.seleccionTablaDinamica.ejercicioCompletado) return;
    this.seleccionTablaDinamica.valores.push({ [nuevaSeleccion]: valor });
    appController.userSettings.settings.valores =
      this.seleccionTablaDinamica.valores;
  },
  ordenarValoresSeleccionadosTD(nuevoOrdenValores) {
    if (state.seleccionTablaDinamica.ejercicioCompletado) return;
    this.seleccionTablaDinamica.valores = nuevoOrdenValores.map((v) =>
      this.seleccionTablaDinamica.valores.find(
        (vals) => Object.keys(vals)[0] == v
      )
    );
    appController.userSettings.settings.valores =
      this.seleccionTablaDinamica.valores;

    // Verifica si los valores recomendados están vacíos
    if (appController.app.baseSettings.valoresSeleccionadaTD.length === 0) {
      this.handleFirstChangeMade();
      window.tabEl.handleChat(
        `No se recomienda seleccionar ningun valor.`,
        "error"
      );
      return;
    }

    let valoresCorrectosSeleccionados = this.seleccionTablaDinamica.valores
      .map((v) => Object.keys(v)[0])
      .filter((valor) =>
        appController.app.baseSettings.valoresSeleccionadaTD.includes(valor)
      );

    let ordenCorrecto =
      JSON.stringify(
        this.seleccionTablaDinamica.valores.map((v) => Object.keys(v)[0])
      ) ===
      JSON.stringify(appController.app.baseSettings.valoresSeleccionadaTD);
    let cantidadCorrecta =
      this.seleccionTablaDinamica.valores.length ===
      appController.app.baseSettings.valoresSeleccionadaTD.length;

    if (
      valoresCorrectosSeleccionados.length ===
      appController.app.baseSettings.valoresSeleccionadaTD.length
    ) {
      if (ordenCorrecto && cantidadCorrecta) {
        if (this.seleccionTablaDinamica.valores.length > 1) {
          window.tabEl.handleChat(
            `Los valores seleccionados y su orden son correctos.`,
            "correct"
          );
          this.verificarSeleccion();
        } else {
          window.tabEl.handleChat(
            `El valor seleccionado "${valoresCorrectosSeleccionados[0]}" es correcto.`,
            "correct"
          );
          this.verificarSeleccion();
        }
      } else if (!cantidadCorrecta) {
        this.handleFirstChangeMade();
        window.tabEl.handleChat(
          `El número de valores seleccionados no es correcto. Por favor, verifica tus selecciones.`,
          "error"
        );
      } else {
        window.tabEl.handleChat(
          `Los valores seleccionados son correctos, pero el orden no es correcto. Por favor, verifica el orden de tus selecciones.`,
          "warning"
        );
      }
    } else if (
      valoresCorrectosSeleccionados.length > 0 &&
      valoresCorrectosSeleccionados.length <
        appController.app.baseSettings.valoresSeleccionadaTD.length
    ) {
      // Encuentra los valores incorrectos
      let valoresIncorrectos = this.seleccionTablaDinamica.valores
        .map((v) => Object.keys(v)[0])
        .filter(
          (valor) =>
            !appController.app.baseSettings.valoresSeleccionadaTD.includes(
              valor
            )
        );

      if (valoresIncorrectos.length > 0) {
        // Muestra un mensaje con los valores incorrectos
        window.tabEl.handleChat(
          `El valor "${valoresIncorrectos.join(", ")}" es incorrecto.`,
          "error"
        );
      } else {
        window.tabEl.handleChat(
          `El valor seleccionado "${valoresCorrectosSeleccionados.join(
            ", "
          )}" es correcto, pero faltan más valores.`,
          "warning"
        );
      }
    } else if (
      this.seleccionTablaDinamica.valores.length >
      appController.app.baseSettings.valoresSeleccionadaTD.length
    ) {
      // Encuentra los valores innecesarios
      let valoresInnecesarios = this.seleccionTablaDinamica.valores
        .map((v) => Object.keys(v)[0])
        .filter(
          (valor) =>
            !appController.app.baseSettings.valoresSeleccionadaTD.includes(
              valor
            )
        );

      // Muestra un mensaje con los valores innecesarios
      this.handleFirstChangeMade();
      window.tabEl.handleChat(
        `Ya has seleccionado todos los valores necesarios. El valor "${valoresInnecesarios.join(
          ", "
        )}" no es necesario.`,
        "error"
      );
    } else {
      this.handleFirstChangeMade();
      window.tabEl.handleChat(
        `Los valores seleccionados no son correctos. Por favor, prueba con otros valores.`,
        "error"
      );
    }
  },
  agregarFuncionTD(nombre, nuevaFuncion) {
    this.timer = true;
    this.editingBlocked = true;
    this.actualizarIntervaloYRenderizar();
    this.actualizarReloj();
    if (state.seleccionTablaDinamica.ejercicioCompletado) return;

    const target = this.seleccionTablaDinamica.valores.find(
      (v) => Object.keys(v) == nombre
    );
    target[nombre] = nuevaFuncion;

    if (target) {
      // Verifica si la función seleccionada es la recomendada para el valor
      let funcionRecomendada =
        appController.app.baseSettings.funcionesSeleccionadasTD[
          appController.app.baseSettings.valoresSeleccionadaTD.indexOf(nombre)
        ];
      if (nuevaFuncion === funcionRecomendada) {
        appController.userSettings.settings.valores =
          this.seleccionTablaDinamica.valores;

        // Verifica si todas las funciones seleccionadas son las recomendadas
        let allFunctionsCorrect = this.seleccionTablaDinamica.valores.every(
          (valor, index) => {
            let nombreValor = Object.keys(valor)[0];
            let funcionValor = Object.values(valor)[0];
            let funcionRecomendada =
              appController.app.baseSettings.funcionesSeleccionadasTD[
                appController.app.baseSettings.valoresSeleccionadaTD.indexOf(
                  nombreValor
                )
              ];
            return funcionValor === funcionRecomendada;
          }
        );

        if (allFunctionsCorrect) {
          window.tabEl.handleChat(
            `Todas las funciones seleccionadas son correctas.`,
            "correct"
          );
          this.verificarSeleccion();
        } else {
          window.tabEl.handleChat(
            `La función "${nuevaFuncion}" para el valor "${nombre}" es correcta, pero faltan más funciones.`,
            "warning"
          );
        }
      } else {
        this.handleFirstChangeMade();
        window.tabEl.handleChat(
          `La función seleccionada "${nuevaFuncion}" no es la recomendada para el valor "${nombre}". Prueba con otras`,
          "error"
        );
      }
    }
  },
  eliminarFilaTD(fila) {
    if (state.seleccionTablaDinamica.ejercicioCompletado) return;
    this.seleccionTablaDinamica.filas =
      this.seleccionTablaDinamica.filas.filter((f) => f !== fila);
    appController.userSettings.settings.filas =
      this.seleccionTablaDinamica.filas;
  },
  eliminarColumnaTD(columna) {
    if (state.seleccionTablaDinamica.ejercicioCompletado) return;
    this.seleccionTablaDinamica.columnas =
      this.seleccionTablaDinamica.columnas.filter((c) => c !== columna);
    appController.userSettings.settings.columnas =
      this.seleccionTablaDinamica.columnas;
  },
  eliminarValorTD(valor) {
    if (state.seleccionTablaDinamica.ejercicioCompletado) return;
    this.seleccionTablaDinamica.valores =
      this.seleccionTablaDinamica.valores.filter(
        (v) => Object.keys(v)[0] !== valor
      );
    appController.userSettings.settings.valores =
      this.seleccionTablaDinamica.valores;
  },
  eliminarFuncionTD() {
    if (state.seleccionTablaDinamica.ejercicioCompletado) return;
    this.seleccionTablaDinamica.funcion = "";
    appController.userSettings.settings.valores =
      this.seleccionTablaDinamica.valores;
  },
  subscribe(callback) {
    // recibe callbacks para ser avisados posteriormente
    this.tdListener = callback;
  },
  armarTD() {
    this.tdListener();
  },
  actualizarIntervaloYRenderizar() {
    const event = new CustomEvent("stateUpdated", { detail: this });
    window.dispatchEvent(event);
  },
  actualizarReloj() {
    const event = new CustomEvent("stateChanged", { detail: this });
    window.dispatchEvent(event);
  },
  verificarSeleccion() {
    // Verifica si las filas seleccionadas son las recomendadas
    let filasCorrectasSeleccionadas =
      appController.app.baseSettings.filaSeleccionadaTD.length === 0 ||
      this.seleccionTablaDinamica.filas.length === 0 ||
      this.seleccionTablaDinamica.filas.every((fila) =>
        appController.app.baseSettings.filaSeleccionadaTD.includes(fila)
      );
    let todasLasFilasRecomendadasSeleccionadas =
      appController.app.baseSettings.filaSeleccionadaTD.every((fila) =>
        this.seleccionTablaDinamica.filas.includes(fila)
      );

    // Verifica si las columnas seleccionadas son las recomendadas
    let columnasCorrectasSeleccionadas =
      appController.app.baseSettings.columnaSeleccionadaTD.length === 0 ||
      this.seleccionTablaDinamica.columnas.length === 0 ||
      this.seleccionTablaDinamica.columnas.every((columna) =>
        appController.app.baseSettings.columnaSeleccionadaTD.includes(columna)
      );
    let todasLasColumnasRecomendadasSeleccionadas =
      appController.app.baseSettings.columnaSeleccionadaTD.every((columna) =>
        this.seleccionTablaDinamica.columnas.includes(columna)
      );

    // Verifica si los valores seleccionados son los recomendados
    let valoresCorrectosSeleccionados =
      appController.app.baseSettings.valoresSeleccionadaTD.length === 0 ||
      this.seleccionTablaDinamica.valores.length === 0 ||
      this.seleccionTablaDinamica.valores.every((valor) =>
        appController.app.baseSettings.valoresSeleccionadaTD.includes(
          Object.keys(valor)[0]
        )
      );
    let todosLosValoresRecomendadosSeleccionados =
      appController.app.baseSettings.valoresSeleccionadaTD.every((valor) =>
        this.seleccionTablaDinamica.valores
          .map((v) => Object.keys(v)[0])
          .includes(valor)
      );

    let funcionesCorrectasSeleccionadas =
      this.seleccionTablaDinamica.valores.every((valor) => {
        let nombreValor = Object.keys(valor)[0];
        let funcionValor = valor[nombreValor];
        let indiceValor =
          appController.app.baseSettings.valoresSeleccionadaTD.indexOf(
            nombreValor
          );
        return (
          funcionValor ===
          appController.app.baseSettings.funcionesSeleccionadasTD[indiceValor]
        );
      });

    if (
      filasCorrectasSeleccionadas &&
      todasLasFilasRecomendadasSeleccionadas &&
      columnasCorrectasSeleccionadas &&
      todasLasColumnasRecomendadasSeleccionadas &&
      valoresCorrectosSeleccionados &&
      todosLosValoresRecomendadosSeleccionados &&
      funcionesCorrectasSeleccionadas
    ) {
      this.seleccionTablaDinamica.ejercicioCompletado = true;
      appController.userSettings.settings.ejercicioCompletado =
        this.seleccionTablaDinamica.ejercicioCompletado;
      window.tabEl.handleChat(
        `Felicitaciones! Has completado el ejercicio correctamente.`,
        "correct"
      );
      this.timer = false;
      this.firstChangeMade = false;
      pgEvent.postEvent("SUCCESS", "Bien hecho", [], "");
      // appController.userSettings.save();
      this.actualizarIntervaloYRenderizar();
      this.actualizarReloj();
    }
    //Actualizar los valores en seleccionGraficos
  },
  agregarTipoGrafico(nuevoValorGrafico) {
    this.seleccionGraficos.seleccion.tipoGrafico = nuevoValorGrafico;
    this.timer = true;
    this.editingBlocked = true;
    this.actualizarIntervaloYRenderizar();
    this.actualizarReloj();
    console.log(this.seleccionGraficos.seleccion);
},
agregarEtiquetas(nuevoValorEtiqueta) {
    this.seleccionGraficos.seleccion.etiqueta = nuevoValorEtiqueta;
    this.timer = true;
    this.editingBlocked = true;
    this.actualizarIntervaloYRenderizar();
    this.actualizarReloj();
    console.log(this.seleccionGraficos.seleccion);
},
agregarEjeX(nuevoValorEjeX) {
    this.seleccionGraficos.seleccion.ejeX = nuevoValorEjeX;
    this.timer = true;
    this.editingBlocked = true;
    this.actualizarIntervaloYRenderizar();
    this.actualizarReloj();
    console.log(this.seleccionGraficos.seleccion);
},
agregarSerie(nuevoValorEjeY) {
    this.seleccionGraficos.seleccion.ejeY = nuevoValorEjeY;
    this.timer = true;
    this.editingBlocked = true;
    this.actualizarIntervaloYRenderizar();
    this.actualizarReloj();
    console.log(this.seleccionGraficos.seleccion);
},
agregarHuecoCirculo(nuevoValorHuecoCirculo) {
  this.seleccionGraficos.seleccion.huecoCirculo = nuevoValorHuecoCirculo;
  this.timer = true;
  this.editingBlocked = true;
  this.actualizarIntervaloYRenderizar();
  this.actualizarReloj();
  console.log(this.seleccionGraficos.seleccion);
},

//  Validacion Graficos

validarTipoGrafico(tipo) {
  console.log(appController)
  if (tipo == appController.app.baseSettings.tipoGrafico) {
    window.tabEl.handleChat(`El tipo de grafico es correcto.`, "correct");
  } else {
    window.tabEl.handleChat(`El tipo de grafico NO es correcto.`, "error");
  }
},

validarEtiquetaGrafico(valorColumna) {
  console.log(appController)
  if (valorColumna == appController.app.baseSettings.columna) {
    window.tabEl.handleChat(`La columna seleccionada es correcta.`, "correct");
  } else {
    window.tabEl.handleChat(`La columna seleccionada NO es correcta.`, "error");
  }
},

validarHuecoCirculo(valorHueco) {
  console.log(appController)
  if (valorHueco == appController.app.baseSettings.huecoCirculo) {
    window.tabEl.handleChat(`El porcentaje del círculo es correcto.`, "correct");
  } else {
    window.tabEl.handleChat(`El porcentaje del círculo NO es correcto.`, "error");
  }
},
};





      
