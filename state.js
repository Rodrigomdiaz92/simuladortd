import { appController } from "./appController";
import { pgEvent } from "./utils/pgEvent";
//
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
  verificarSeleccionMensaje(seleccion) {
    let tipoSeleccion = seleccion === "fila" ? "fila" : "columna";
    let seleccionadaTD =
      appController.app.baseSettings[`${tipoSeleccion}SeleccionadaTD`];
    let seleccionDinamica = this.seleccionTablaDinamica[`${tipoSeleccion}s`];

    // Verifica si las filas/columnas recomendadas están vacías
    if (seleccionadaTD.length === 0) {
      this.handleFirstChangeMade();
      window.tabEl.handleChat(
        `No se recomienda seleccionar ninguna ${tipoSeleccion}.`,
        "error"
      );
      return;
    }

    // Retorna sin decir nada si la selección dinámica está vacía
    if (seleccionDinamica.length === 0) {
      return;
    }

    let seleccionCorrecta = seleccionDinamica.filter((item) =>
      seleccionadaTD.includes(item)
    );
    let cantidadCorrecta = seleccionDinamica.length === seleccionadaTD.length;
    let ordenCorrecto =
      JSON.stringify(seleccionDinamica) === JSON.stringify(seleccionadaTD);

    if (seleccionCorrecta.length === seleccionadaTD.length) {
      if (ordenCorrecto && cantidadCorrecta) {
        let mensaje =
          seleccionDinamica.length > 1
            ? `Las ${tipoSeleccion}s seleccionadas y su orden son correctos.`
            : `La ${tipoSeleccion} seleccionada "${seleccionCorrecta[0]}" es correcta.`;
        window.tabEl.handleChat(mensaje, "correct");
        appController.app.addProgressToProgressBar();
        this.verificarSeleccion();
      } else {
        let mensaje, tipoNotificacion;
        if (!cantidadCorrecta) {
          mensaje = `El número de ${tipoSeleccion}s seleccionadas no es correcto. Por favor, verifica tus selecciones.`;
          tipoNotificacion = "error";
        } else {
          mensaje = `Las ${tipoSeleccion}s seleccionadas son correctas, pero el orden no es correcto. Por favor, verifica el orden de tus selecciones.`;
          tipoNotificacion = "warning";
          appController.app.addProgressToProgressBar();
        }
        this.handleFirstChangeMade();
        window.tabEl.handleChat(mensaje, tipoNotificacion);
        appController.app.subProgressToProgressBar();
      }
    } else {
      this.handleFirstChangeMade();
      if (seleccionCorrecta.length > 0) {
        window.tabEl.handleChat(
          `La ${tipoSeleccion} seleccionada "${seleccionCorrecta.join(
            ", "
          )}" es correcta, pero faltan más ${tipoSeleccion}s.`,
          "warning"
        );
        appController.app.addProgressToProgressBar();
      } else {
        window.tabEl.handleChat(
          `Las ${tipoSeleccion}s seleccionadas no son correctas. Por favor, prueba con otras ${tipoSeleccion}s.`,
          "error"
        );
      }
    }
  },
  verificarSeleccionValores() {
    let seleccionadaTD = appController.app.baseSettings.valorSeleccionadaTD;
    let seleccionDinamica = this.seleccionTablaDinamica.valores.map(
      (v) => Object.keys(v)[0]
    );

    // Verifica si los valores recomendados están vacíos
    if (seleccionadaTD.length === 0) {
      this.handleFirstChangeMade();
      window.tabEl.handleChat(
        `No se recomienda seleccionar ningún valor.`,
        "error"
      );
      return;
    }

    if (seleccionDinamica.length === 0) {
      return;
    }

    let seleccionCorrecta = seleccionDinamica.filter((valor) =>
      seleccionadaTD.includes(valor)
    );
    let cantidadCorrecta = seleccionDinamica.length === seleccionadaTD.length;
    let ordenCorrecto =
      JSON.stringify(seleccionDinamica) === JSON.stringify(seleccionadaTD);

    if (seleccionCorrecta.length === seleccionadaTD.length) {
      if (ordenCorrecto && cantidadCorrecta) {
        let mensaje =
          seleccionDinamica.length > 1
            ? `Los valores seleccionados y su orden son correctos.`
            : `El valor seleccionado "${seleccionCorrecta[0]}" es correcto.`;
        window.tabEl.handleChat(mensaje, "correct");
        appController.app.addProgressToProgressBar();
      } else {
        let mensaje, tipoNotificacion;
        if (!cantidadCorrecta) {
          mensaje = `El número de valores seleccionados no es correcto. Por favor, verifica tus selecciones.`;
          tipoNotificacion = "error";
        } else {
          mensaje = `Los valores seleccionados son correctos, pero el orden no es correcto. Por favor, verifica el orden de tus selecciones.`;
          tipoNotificacion = "warning";
          // appController.app.subProgressToProgressBar();
        }
        this.handleFirstChangeMade();
        window.tabEl.handleChat(mensaje, tipoNotificacion);
      }
    } else {
      this.handleFirstChangeMade();
      if (seleccionCorrecta.length > 0) {
        let incorrectas = seleccionDinamica.filter(
          (valor) => !seleccionadaTD.includes(valor)
        );
        if (incorrectas.length > 0) {
          window.tabEl.handleChat(
            `El valor "${incorrectas.join(", ")}" es incorrecto.`,
            "error"
          );
        } else {
          window.tabEl.handleChat(
            `El valor seleccionado "${seleccionCorrecta.join(
              ", "
            )}" es correcto, pero faltan más valores.`,
            "warning"
          );
          appController.app.addProgressToProgressBar();
        }
      } else {
        window.tabEl.handleChat(
          `Los valores seleccionados no son correctos. Por favor, prueba con otros valores.`,
          "error"
        );
      }
    }

    // Llama a la nueva función para verificar la función del último valor agregado
    this.verificarFuncionValor(this.ultimoValorAgregado, seleccionadaTD);
  },
  verificarFuncionValor(ultimoValor, seleccionadaTD) {
    if (ultimoValor && seleccionadaTD.includes(ultimoValor)) {
      let funcionValor = this.seleccionTablaDinamica.valores.find(
        (v) => Object.keys(v)[0] === ultimoValor
      )[ultimoValor];
      let funcionRecomendada =
        appController.app.baseSettings.funcionesSeleccionadasTD[
          appController.app.baseSettings.valorSeleccionadaTD.indexOf(
            ultimoValor
          )
        ];

      if (funcionValor === funcionRecomendada) {
        window.tabEl.handleChat(
          `La función para el valor "${ultimoValor}" es correcta.`,
          "correct"
        );
        appController.app.addProgressToProgressBar();
        this.verificarSeleccion();
      } else {
        window.tabEl.handleChat(
          `La función para el valor "${ultimoValor}" no es correcta.`,
          "error"
        );
      }
    }
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
  appController.userSettings.settings.tipoGrafico = tipo
  if (tipo == appController.app.baseSettings.tipoGrafico) {
    window.tabEl.handleChat(`El tipo de grafico es correcto.`, "correct");
  } else {
    window.tabEl.handleChat(`El tipo de grafico NO es correcto.`, "error");
  }
},

validarEtiquetaGrafico(valorColumna) {
  appController.userSettings.settings.etiqueta = valorColumna
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
validarValorGrafico(valorGrafico) {
  appController.userSettings.settings.valorGrafico = valorGrafico
  if (valorGrafico == appController.app.baseSettings.valorGrafico) {
    window.tabEl.handleChat(`El valor seleccionado es correcto.`, "correct");
  } else {
    window.tabEl.handleChat(`El valor seleccionado NO es correcto.`, "error");
  }
},

  validarHuecoCirculo(valorHueco) {
    appController.userSettings.settings.huecoCirculo = valorHueco
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

  graficoTortaCompletado(tipoGrafico, valorColumna, valorGrafico, valorHueco){
  if (tipoGrafico == appController.app.baseSettings.tipoGrafico && 
    valorColumna == appController.app.baseSettings.etiqueta &&
    valorGrafico == appController.app.baseSettings.valorGrafico &&
    valorHueco == appController.app.baseSettings.huecoCirculo) {
        window.tabEl.handleChat(
          `El grafico esta completo`,
          "correct");
        appController.userSettings.settings.ejercicioCompletado = true;
        pgEvent.postEvent("SUCCESS","Bien hecho","","");
      } else {
        window.tabEl.handleChat(
          `Hay errores en tu grafico.`,
          "error"
        );
        pgEvent.postEvent("Failure","Mal hecho","","");
      }
  },


// validarEjeXBarras(valorEjeX) {
//   appController.app.userSettings.settings.ejeX = valorEjeX;
//   if (valorEjeX == appController.app.baseSettings.ejeX) {
//     window.tabEl.handleChat(`¡Buen Trabajo!`, "correct");
//   } else {
//     window.tabEl.handleChat(`La columna seleccionada no es la pedida por el ejercicio.`, "error");
//   }
// },

// validarSerieBarras(valorSerie) {
  
//   if (valorSerie == appController.app.baseSettings.serie) {
//     window.tabEl.handleChat(`¡Buen Trabajo!`, "correct");
//   } else {
//     window.tabEl.handleChat(`La Serie seleccionada no es la pedida por el ejercicio.`, "error");
//   }
// },

//Validaciones de arrays y textos
validarTexto(texto) { //Formatea strings con caracteres extraños (ñ,´)
  const regex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
  return regex.test(texto);
},
limpiarArrayTexto(array) {
const regex = /[^a-zA-ZñÑáéíóúÁÉÍÓÚ\s]/g;
// Recorre el array y limpia cada string
return array.map(texto => texto.replace(regex, ''));
},
ordenarAlfabeticamente(array) { //ordena alfabeticamente un array
return array.sort((a, b) => a.localeCompare(b));
},
quitarAcentosYCaracteresEspeciales(texto) {
// Normaliza el texto a forma descompuesta
const textoNormalizado = texto.normalize('NFD');
// Elimina los caracteres diacríticos y otros caracteres especiales
return textoNormalizado.replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z\s]/g, '');
},
arraysIguales(array1, array2) {
// Primero, verifica si ambos arrays tienen la misma longitud
if (array1.length !== array2.length) {
    return false;
}
// Luego, compara los elementos en cada índice
for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
        return false;
    }
}
// Si todos los elementos son iguales, los arrays son iguales
return true;
},
validarEjeXBarras(valorEjeX) {
appController.app.userSettings.settings.ejeX = valorEjeX;
let ingresado = this.quitarAcentosYCaracteresEspeciales(valorEjeX);
let correcto = this.quitarAcentosYCaracteresEspeciales(appController.app.baseSettings.ejeX);
if(ingresado == correcto){
  window.tabEl.handleChat(`¡Buen Trabajo!`, "correct");
} else {
  window.tabEl.handleChat(`La columna seleccionada "${valorEjeX}" no es la pedida para eje X.`, "error");
}
},
validarSerieBarras(valorSerie) {
appController.app.userSettings.settings.serie = valorSerie;
let ingresado= this.ordenarAlfabeticamente(valorSerie);
let correcto= this.ordenarAlfabeticamente(appController.app.baseSettings.serie);
if (this.arraysIguales(ingresado,correcto)) {
  window.tabEl.handleChat(`¡Buen Trabajo!`, "correct");
} else {
  window.tabEl.handleChat(`La Serie seleccionada no es la pedida por el ejercicio.`, "error");
}
},
};
