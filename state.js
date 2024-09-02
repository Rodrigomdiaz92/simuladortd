import { appController } from "./appController";
import { pgEvent } from "./utils/pgEvent";
import {
  quitarAcentosYCaracteresEspeciales,
  ordenarAlfabeticamente,
  arraysIguales,
} from "./utils/text";
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
      serie: "",
      apilado: "",
      escala: "",
      ejecutado: false,
      valorHistograma: "",
      segmento: "",
      ejeXDispersion: "",
      ejeYDispersion: "",
      lineaDeTendencia: "",
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
  agregarValorHistograma(nuevoValorHistograma) {
    this.seleccionGraficos.seleccion.valorHistograma = nuevoValorHistograma;
    this.timer = true;
    this.editingBlocked = true;
    this.actualizarIntervaloYRenderizar();
    this.actualizarReloj();
    console.log(this.seleccionGraficos.seleccion);
  },
  agregarSegmento(nuevoSegmento) {
    this.seleccionGraficos.seleccion.Segmento = nuevoSegmento;
    this.timer = true;
    this.editingBlocked = true;
    this.actualizarIntervaloYRenderizar();
    this.actualizarReloj();
    console.log(this.seleccionGraficos.seleccion);
  },

  //  Validacion Graficos
  validarTipoGrafico(tipo) {
    appController.userSettings.settings.tipoGrafico = tipo;
    if (tipo == appController.app.baseSettings.tipoGrafico) {
      window.tabEl.handleChat(`El tipo de gráfico es correcto.`, "correct");
    } else {
      window.tabEl.handleChat(`El tipo de gráfico NO es correcto.`, "error");
    }
  },

  validarEtiquetaGrafico(valorColumna) {
    appController.userSettings.settings.etiqueta = valorColumna;
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
    appController.userSettings.settings.valorGrafico = valorGrafico;
    if (valorGrafico == appController.app.baseSettings.valorGrafico) {
      window.tabEl.handleChat(`El valor seleccionado es correcto.`, "correct");
    } else {
      window.tabEl.handleChat(`El valor seleccionado NO es correcto.`, "error");
    }
  },

  validarHuecoCirculo(valorHueco) {
    appController.userSettings.settings.huecoCirculo = valorHueco;
    if (valorHueco < 0 || valorHueco > 50) {
      window.tabEl.handleChat(
        `El porcentaje del círculo debe ser entre 0 y 50.`,
        "error"
      );
    }
  },

  graficoTortaCompletado(tipoGrafico, valorColumna, valorGrafico, valorHueco) {
    let errores = [];

    if (tipoGrafico != appController.app.baseSettings.tipoGrafico) {
        errores.push("El tipo de gráfico no es correcto.");
    }

    if (valorColumna != appController.app.baseSettings.etiqueta) {
        errores.push("El valor de la columna no es correcto.");
    }

    if (valorGrafico != appController.app.baseSettings.valorGrafico) {
        errores.push("El valor del gráfico no es correcto.");
    }

    if (!(valorHueco >= 0 && valorHueco <= 50)) {
        errores.push("El valor del hueco debe estar entre 0 y 50.");
    }

    if (errores.length === 0) {
        window.tabEl.handleChat(`El gráfico está completo`, "correct");
        appController.userSettings.settings.ejercicioCompletado = true;
        pgEvent.postEvent("SUCCESS", "Bien hecho", "", "");
    } else {
        window.tabEl.handleChat(`Hay errores en tu gráfico: ${errores.join(' ')}`, "error");
        pgEvent.postEvent("Failure", "Mal hecho", "", "");
    }
},


  //
  
  // Histograma

  validarvalorHistograma(valorHistograma) {
    appController.userSettings.settings.valorHistograma = valorHistograma;
    if (valorHistograma == appController.app.baseSettings.valorHistograma) {
      window.tabEl.handleChat(`La serie seleccionada es correcta.`, "correct");
    } else {
      window.tabEl.handleChat(`La serie seleccionada NO es correcta.`, "error");
    }
  },
  
  validarSegmento(segmentoValido) {
    appController.userSettings.settings.segmento = segmentoValido;
    console.log("Valor del Segmenssto:", segmentoValido);
    // Proporcionar retroalimentación basada en si el segmento es válido o no
    if (segmentoValido === 1) {
        window.tabEl.handleChat("El segmento seleccionado es correcto.", "correct");
    }
},

graficoDeHistogramaCompletado(valorHistograma) {
  let errores = [];

  // Validación del valor de histograma
  if (valorHistograma !== appController.app.baseSettings.valorHistograma) {
      errores.push("El valor del histograma no es correcto.");
  }

  // Obtener el valor del segmento desde la configuración
  const segmentoValido = appController.userSettings.settings.segmento;

  // Validación del segmento (asegurarse de que `segmentoValido` es un booleano o el valor esperado)
  if (segmentoValido !== 1) {
      errores.push("El valor del segmento no es correcto.");
  }

  console.log("Valor del Histograma:", valorHistograma);
  console.log("Valor del Segmento:", segmentoValido);

  // Si no hay errores, se completa el gráfico
  if (errores.length === 0) {
      window.tabEl.handleChat("El gráfico está completo", "correct");
      appController.userSettings.settings.ejercicioCompletado = true;
      pgEvent.postEvent("SUCCESS", "Bien hecho", "", "");
  } else {
      window.tabEl.handleChat(`Hay errores en tu gráfico: ${errores.join(' ')}`, "error");
      pgEvent.postEvent("Failure", "Mal hecho", "", "");
  }
},

    //

    //Dispersion 

  validarEjeXDispersion(ejeXDispersion) {
    appController.userSettings.settings.ejeXDispersion = ejeXDispersion;
    if (ejeXDispersion == appController.app.baseSettings.ejeXDispersion) {
      window.tabEl.handleChat(`El valor seleccionado es correcto.`, "correct");
    } else {
      window.tabEl.handleChat(`El valor seleccionado NO es correcto.`, "error");
    }
  },
  
  validarEjeYDispersion(ejeYDispersion) {
    appController.userSettings.settings.ejeYDispersion = ejeYDispersion;
    if (ejeYDispersion == appController.app.baseSettings.ejeYDispersion) {
      window.tabEl.handleChat(`El valor seleccionado es correcto.`, "correct");
    } else {
      window.tabEl.handleChat(`El valor seleccionado NO es correcto.`, "error");
    }
  },
  
  validarLineaDeTendencia(lineaDeTendencia) {
    appController.userSettings.settings.lineaDeTendencia = lineaDeTendencia;
    if (lineaDeTendencia == appController.app.baseSettings.lineaDeTendencia) {
      window.tabEl.handleChat(`Linea de tendencia seleccionada.`, "correct");
    } else {
      window.tabEl.handleChat(`La linea de tendencia NO esta seleccionada.`, "error");
    }
  },


  graficoDeDispersionCompletado(ejeXDispersion, ejeYDispersion, lineaDeTendencia) {
    let errores = [];

    // Validación del eje X
    if (ejeXDispersion != appController.app.baseSettings.ejeXDispersion) {
        errores.push("El valor del eje X de dispersión no es correcto.");
    }

    // Validación del eje Y
    if (ejeYDispersion != appController.app.baseSettings.ejeYDispersion) {
        errores.push("El valor del eje Y de dispersión no es correcto.");
    }

    // Validación de la línea de tendencia
    if (lineaDeTendencia != appController.app.baseSettings.lineaDeTendencia) {
        errores.push("El valor de la línea de tendencia no es correcto.");
    }

    // Si no hay errores, se completa el gráfico
    if (errores.length === 0) {
        window.tabEl.handleChat(`El gráfico está completo`, "correct");
        appController.userSettings.settings.ejercicioCompletado = true;
        pgEvent.postEvent("SUCCESS", "Bien hecho", "", "");
    } else {
        window.tabEl.handleChat(`Hay errores en tu gráfico: ${errores.join(' ')}`, "error");
        pgEvent.postEvent("Failure", "Mal hecho", "", "");
    }
},

    //


  validarEjeXBarras(valorEjeX) {
    appController.userSettings.settings.ejeX = valorEjeX;
    let ingresado = quitarAcentosYCaracteresEspeciales(valorEjeX);
    let correcto = quitarAcentosYCaracteresEspeciales(
      appController.app.baseSettings.ejeX
    );
    if (ingresado == correcto) {
      window.tabEl.handleChat(`¡Buen Trabajo!`, "correct");
    } else {
      window.tabEl.handleChat(
        `La columna seleccionada "${valorEjeX}" no es la pedida para eje X.`,
        "error"
      );
    }
  },

  validarSerieBarras(valorSerie, series) {
    appController.userSettings.settings.serie = series;
    let ingresado = ordenarAlfabeticamente(valorSerie);
    let correcto = ordenarAlfabeticamente(appController.app.baseSettings.serie);
    if (arraysIguales(ingresado, correcto)) {
      window.tabEl.handleChat(`¡Buen Trabajo!`, "correct");
    } else {
      window.tabEl.handleChat(
        `La serie seleccionada no es la pedida por el ejercicio.`,
        "error"
      );
    }
  },

  validarEscalaBarras(escala) {
    appController.userSettings.settings.escala = escala;

    if (escala == appController.app.baseSettings.escala) {
      window.tabEl.handleChat(`¡Buen Trabajo!`, "correct");
    } else {
      window.tabEl.handleChat(
        `La escala seleccionada no es la pedida por la consigna.`,
        "error"
      );
    }
  },

  //Apilado

  validarApiladoBarras(checkApilado) {
    appController.userSettings.settings.apilado = checkApilado;
    let ingresado = checkApilado;
    let correcto = appController.app.baseSettings.apilado;
    if (ingresado == correcto) {
      window.tabEl.handleChat(`¡Buen Trabajo!`, "correct");
    } else {
      window.tabEl.handleChat(`Revisa si tu gráfico debe ser apilado o no.`, "error");
    }
  },

  graficoBarrasCompletado(tipoGrafico, ejeX, series, apilamiento) {
    let errores = [];
    let serieIngresada = ordenarAlfabeticamente(series);
    let serieCorrecta = ordenarAlfabeticamente(appController.app.baseSettings.serie);

    // Validación del tipo de gráfico
    if (tipoGrafico != appController.app.baseSettings.tipoGrafico) {
        errores.push("El tipo de gráfico no es correcto.");
    }

    // Validación del eje X
    if (
        quitarAcentosYCaracteresEspeciales(ejeX) == 
        quitarAcentosYCaracteresEspeciales(appController.app.baseSettings.ejeX)
    ) {
        errores.push("El eje X no es correcto.");
    }

    // Validación de las series
    if (!arraysIguales(serieIngresada, serieCorrecta)) {
        errores.push("Las series no son correctas.");
    }

    // Validación del apilamiento
    if (apilamiento != appController.app.baseSettings.apilado) {
        errores.push("El valor del apilamiento no es correcto.");
    }

    // Si no hay errores, se completa el gráfico
    if (errores.length === 0) {
        window.tabEl.handleChat(`El gráfico está completo`, "correct");
        appController.userSettings.settings.ejercicioCompletado = true;
        pgEvent.postEvent("SUCCESS", "Bien hecho", "", "");
    } else {
        window.tabEl.handleChat(`Hay errores en tu gráfico: ${errores.join(' ')}`, "error");
        pgEvent.postEvent("Failure", "Mal hecho", "", "");
    }
},


  /*graficoBarrasCompletado(tipoGrafico, ejeX, series, apilamiento) {
    let serieIngresada = series;
    let serieCorrecta = ordenarAlfabeticamente(
      appController.app.baseSettings.serie
    );
    if (
      tipoGrafico == appController.app.baseSettings.tipoGrafico &&
      quitarAcentosYCaracteresEspeciales(ejeX) ==
        quitarAcentosYCaracteresEspeciales(
          appController.app.baseSettings.ejeX
        ) &&
      arraysIguales(serieIngresada, serieCorrecta) &&
      apilamiento == appController.app.baseSettings.apilado
    ) {
      window.tabEl.handleChat(`El gráfico esta completo`, "correct");
      appController.userSettings.settings.ejercicioCompletado = true;
      pgEvent.postEvent("SUCCESS", "Bien hecho", "", "");
    } else {
      window.tabEl.handleChat(`Hay errores en tu gráfico.`, "error");
      pgEvent.postEvent("Failure", "Mal hecho", "", "");
    }
  },*/


  fueEjecutado() {
    console.log("fue ejecutado");

    appController.userSettings.settings.ejecutado = true;
  },
  cambiarTitulos(titulos) {
    appController.userSettings.settings.tituloGrafico =
      titulos.grafico || appController.userSettings.settings.tituloGrafico;
    appController.userSettings.settings.tituloEjeX =
      titulos.ejeX || appController.userSettings.settings.tituloEjeX;
    appController.userSettings.settings.tituloEjeY =
      titulos.ejeY || appController.userSettings.settings.tituloEjeY;
  },
};
