import { appController } from "./appController";
import { pgEvent } from "./utils/pgEvent";

export const state = {
  firstChangeMade: false,
  ultimaVariableAgregada: "",
  ultimoValorAgregado: null,
  progreso: 0,
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
      valorGrafico: "",
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

    this.verificarSeleccionMensaje("fila");
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

    this.verificarSeleccionMensaje("columna");
  },
  valorSeleccionadaTD(nuevaSeleccion, valor) {
    this.timer = true;
    this.editingBlocked = true;
    this.actualizarIntervaloYRenderizar();
    this.actualizarReloj();
    if (state.seleccionTablaDinamica.ejercicioCompletado) return;
    this.seleccionTablaDinamica.valores.push({ [nuevaSeleccion]: valor });
    this.ultimoValorAgregado = nuevaSeleccion; // Añade esta línea

    appController.userSettings.settings.valores =
      this.seleccionTablaDinamica.valores;
  },
  ordenarValoresSeleccionadosTD(nuevoOrdenValores) {
    if (state.seleccionTablaDinamica.ejercicioCompletado) return;
    if (this.valoresAnteriores !== undefined) {
      let seleccionACumplir =
        appController.app.baseSettings.valorSeleccionadaTD;
      let seleccionAnterior = this.valoresAnteriores;
      let ordenEstabaCorrecto =
        JSON.stringify(seleccionAnterior) ===
          JSON.stringify(seleccionACumplir) &&
        seleccionAnterior.length == seleccionACumplir.length;
      if (ordenEstabaCorrecto) {
        console.log("orden estaba correcto pero cambiaste");
        appController.app.subProgressToProgressBar();
        window.tabEl.handleChat(
          `¡Cuidado! Has cambiado el orden recomendado.`,
          "error"
        );
        this.handleFirstChangeMade();
      }
    }
    this.seleccionTablaDinamica.valores = nuevoOrdenValores.map((v) =>
      this.seleccionTablaDinamica.valores.find(
        (vals) => Object.keys(vals)[0] == v
      )
    );
    this.valoresAnteriores = this.seleccionTablaDinamica.valores.map(
      (v) => Object.keys(v)[0]
    );
    appController.userSettings.settings.valores =
      this.seleccionTablaDinamica.valores;

    this.verificarSeleccionValores();
  },
  agregarFuncionTD(nombre, nuevaFuncion) {
    console.log("agregando fcion");
    this.timer = true;
    this.editingBlocked = true;
    this.actualizarIntervaloYRenderizar();
    this.actualizarReloj();
    if (state.seleccionTablaDinamica.ejercicioCompletado) return;
    const target = this.seleccionTablaDinamica.valores.find(
      (v) => Object.keys(v) == nombre
    );
    const funcionAnterior = target[nombre];
    target[nombre] = nuevaFuncion;

    if (target) {
      let funcionRecomendada =
        appController.app.baseSettings.funcionesSeleccionadasTD[
          appController.app.baseSettings.valorSeleccionadaTD.indexOf(nombre)
        ];
      if (nuevaFuncion === funcionRecomendada) {
        console.log("es funcion recomendada");
        appController.userSettings.settings.valores =
          this.seleccionTablaDinamica.valores;

        window.tabEl.handleChat(
          `La función seleccionada "${nuevaFuncion}" es correcta para el valor "${nombre}"`,
          "correct"
        );
        appController.app.addProgressToProgressBar();
        this.verificarSeleccion();
      }
      if (funcionAnterior == funcionRecomendada) {
        //cuidado
        // Verificar si la fila eliminada era una selección correcta
        window.tabEl.handleChat(
          `¡Cuidado! Has cambiado una función recomendada.`,
          "error"
        );
        this.handleFirstChangeMade();
        appController.app.subProgressToProgressBar();
      } else if (nuevaFuncion !== funcionRecomendada) {
        window.tabEl.handleChat(
          `La función seleccionada "${nuevaFuncion}" no es correcta para el valor "${nombre}"`,
          "error"
        );
      }
    }
  },
  eliminarFilaTD(fila) {
    this.timer = true;
    this.editingBlocked = true;
    this.actualizarIntervaloYRenderizar();
    this.actualizarReloj();
    if (state.seleccionTablaDinamica.ejercicioCompletado) return;
    const index = this.seleccionTablaDinamica.filas.indexOf(fila);
    if (index !== -1) {
      this.seleccionTablaDinamica.filas.splice(index, 1);
      appController.userSettings.settings.filas =
        this.seleccionTablaDinamica.filas;

      // Verificar si la fila eliminada era una selección correcta
      if (appController.app.baseSettings.filaSeleccionadaTD.includes(fila)) {
        window.tabEl.handleChat(
          `¡Cuidado! Has eliminado una fila recomendada.`,
          "error"
        );
        this.handleFirstChangeMade();
        appController.app.subProgressToProgressBar();
      } else {
        window.tabEl.handleChat(
          `¡Bien hecho! Has eliminado una fila erronea correctamente.`,
          "correct"
        );
        //appController.app.addProgressToProgressBar();
        this.verificarSeleccion();
      }
    }
  },
  eliminarColumnaTD(columna) {
    this.timer = true;
    this.editingBlocked = true;
    this.actualizarIntervaloYRenderizar();
    this.actualizarReloj();
    if (state.seleccionTablaDinamica.ejercicioCompletado) return;
    const index = this.seleccionTablaDinamica.columnas.indexOf(columna);
    if (index !== -1) {
      this.seleccionTablaDinamica.columnas.splice(index, 1);
      appController.userSettings.settings.columnas =
        this.seleccionTablaDinamica.columnas;

      // Verificar si la columna eliminada era una selección correcta
      if (
        appController.app.baseSettings.columnaSeleccionadaTD.includes(columna)
      ) {
        window.tabEl.handleChat(
          `¡Cuidado! Has eliminado una columna recomendada.`,
          "error"
        );
        this.handleFirstChangeMade();
        appController.app.subProgressToProgressBar();
      } else {
        window.tabEl.handleChat(
          `¡Bien hecho! Has eliminado una columna erronea correctamente.`,
          "correct"
        );
        // appController.app.addProgressToProgressBar();
        this.verificarSeleccion();
      }
    }
  },
  eliminarValorTD(valor) {
    this.timer = true;
    this.editingBlocked = true;
    this.actualizarIntervaloYRenderizar();
    this.actualizarReloj();
    if (state.seleccionTablaDinamica.ejercicioCompletado) return;
    const index = this.seleccionTablaDinamica.valores.findIndex(
      (v) => Object.keys(v)[0] === valor
    );
    if (index !== -1) {
      const deletedValue = this.seleccionTablaDinamica.valores.splice(
        index,
        1
      )[0];
      appController.userSettings.settings.valores =
        this.seleccionTablaDinamica.valores;

      // Verificar si el valor eliminado era una selección correcta
      if (
        appController.app.baseSettings.valorSeleccionadaTD.includes(
          Object.keys(deletedValue)[0]
        )
      ) {
        window.tabEl.handleChat(
          `¡Cuidado! Has eliminado un valor recomendado.`,
          "error"
        );
        this.handleFirstChangeMade();
        appController.app.subProgressToProgressBar();
      } else {
        window.tabEl.handleChat(
          `¡Bien hecho! Has eliminado un valor erroneo correctamente.`,
          "correct"
        );
        // appController.app.addProgressToProgressBar();
        this.verificarSeleccion();
      }
    }
  },
  eliminarFuncionTD() {
    this.timer = true;
    this.editingBlocked = true;
    this.actualizarIntervaloYRenderizar();
    this.actualizarReloj();
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
      appController.app.baseSettings.valorSeleccionadaTD.length === 0 ||
      this.seleccionTablaDinamica.valores.length === 0 ||
      this.seleccionTablaDinamica.valores.every((valor) =>
        appController.app.baseSettings.valorSeleccionadaTD.includes(
          Object.keys(valor)[0]
        )
      );
    let todosLosValoresRecomendadosSeleccionados =
      appController.app.baseSettings.valorSeleccionadaTD.every((valor) =>
        this.seleccionTablaDinamica.valores
          .map((v) => Object.keys(v)[0])
          .includes(valor)
      );

    let funcionesCorrectasSeleccionadas =
      this.seleccionTablaDinamica.valores.every((valor) => {
        let nombreValor = Object.keys(valor)[0];
        let funcionValor = valor[nombreValor];
        let indiceValor =
          appController.app.baseSettings.valorSeleccionadaTD.indexOf(
            nombreValor
          );
        return (
          funcionValor ===
          appController.app.baseSettings.funcionesSeleccionadasTD[indiceValor]
        );
      });

    // Verifica el orden de las selecciones
    let filasOrdenCorrecto =
      JSON.stringify(this.seleccionTablaDinamica.filas) ===
      JSON.stringify(appController.app.baseSettings.filaSeleccionadaTD);
    let columnasOrdenCorrecto =
      JSON.stringify(this.seleccionTablaDinamica.columnas) ===
      JSON.stringify(appController.app.baseSettings.columnaSeleccionadaTD);
    let valoresOrdenCorrecto =
      this.seleccionTablaDinamica.valores
        .map((v) => Object.keys(v)[0])
        .join() === appController.app.baseSettings.valorSeleccionadaTD.join();

    if (
      filasCorrectasSeleccionadas &&
      todasLasFilasRecomendadasSeleccionadas &&
      columnasCorrectasSeleccionadas &&
      todasLasColumnasRecomendadasSeleccionadas &&
      valoresCorrectosSeleccionados &&
      todosLosValoresRecomendadosSeleccionados &&
      funcionesCorrectasSeleccionadas &&
      filasOrdenCorrecto &&
      columnasOrdenCorrecto &&
      valoresOrdenCorrecto
    ) {
      this.seleccionTablaDinamica.ejercicioCompletado = true;
      appController.userSettings.settings.ejercicioCompletado =
        this.seleccionTablaDinamica.ejercicioCompletado;
      window.tabEl.handleChat(
        `¡Felicitaciones! Has completado el ejercicio correctamente.`,
        "correct"
      );
      this.timer = false;
      this.firstChangeMade = false;
      pgEvent.postEvent("SUCCESS", "Bien Hecho!", [], "");
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
  agregarValorGrafico(nuevoValorGrafico) {
    this.seleccionGraficos.seleccion.valorGrafico = nuevoValorGrafico;
    this.timer = true;
    this.editingBlocked = true;
    this.actualizarIntervaloYRenderizar();
    this.actualizarReloj();
    console.log(this.seleccionGraficos.seleccion);
  },

  //  Validacion Graficos
validarTipoGrafico(tipo) {
  
  if (tipo == appController.app.baseSettings.tipoGrafico) {
    window.tabEl.handleChat(`El tipo de grafico es correcto.`, "correct");
  } else {
    window.tabEl.handleChat(`El tipo de grafico NO es correcto.`, "error");
  }
},

  validarEtiquetaGrafico(valorColumna) {
    if (valorColumna == appController.app.baseSettings.etiqueta) {
      window.tabEl.handleChat(
        `La etiqueta seleccionada es correcta.`,
        "correct"
      );
    } else {
      window.tabEl.handleChat(
        `La etiqueta seleccionada NO es correcta.`,
        "error"
      );
    }
  },

validarHuecoCirculo(valorHueco) {
  
  if (valorHueco == appController.app.baseSettings.huecoCirculo) {
    window.tabEl.handleChat(`El porcentaje del círculo es correcto.`, "correct");
  } else {
    window.tabEl.handleChat(`El porcentaje del círculo NO es correcto.`, "error");
  }
},
validarValorGrafico(valorGrafico) {
  
  if (valorGrafico == appController.app.baseSettings.valorGrafico) {
    window.tabEl.handleChat(`El valor seleccionado es correcto.`, "correct");
  } else {
    window.tabEl.handleChat(`El valor seleccionado NO es correcto.`, "error");
  }
},
/*
  validarHuecoCirculo(valorHueco) {
    if (valorHueco == appController.app.baseSettings.huecoCirculo) {
      window.tabEl.handleChat(
        `El porcentaje del círculo es correcto.`,
        "correct"
      );
    } else {
      window.tabEl.handleChat(
        `El porcentaje del círculo NO es correcto.`,
        "error"
      );
    }
  },
  /*ya
validarEjeXBarras(valorEjeX) {
  
  if (valorEjeX == appController.app.baseSettings.ejeX) {
    window.tabEl.handleChat(`¡Buen Trabajo!`, "correct");
  } else {
    window.tabEl.handleChat(`La columna seleccionada no es la pedida por el ejercicio.`, "error");
  }
},

validarSerieBarras(valorSerie) {
  
  if (valorSerie == appController.app.baseSettings.serie) {
    window.tabEl.handleChat(`¡Buen Trabajo!`, "correct");
  } else {
    window.tabEl.handleChat(`La Serie seleccionada no es la pedida por el ejercicio.`, "error");
  }
},

validarFuncionBarras(valorFuncion) {
  
  if (valorFuncion == appController.app.baseSettings.funcion) {
    window.tabEl.handleChat(`¡Buen Trabajo!`, "correct");
  } else {
    window.tabEl.handleChat(`La funcion de agregacion seleccionada no es la pedida por el ejercicio.`, "error");
  }
},

validarEscalaBarras(valorEscala) {
  
  if (valorEscala == appController.app.baseSettings.escala) {
    window.tabEl.handleChat(`¡Buen Trabajo!`, "correct");
  } else {
    window.tabEl.handleChat(`La escala seleccionada no es la pedida por el ejercicio.`, "error");
  }
},

*/

  /*
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

*/
};
