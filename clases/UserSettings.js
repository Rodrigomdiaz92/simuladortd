import { state } from "../state";
import { crearHojaTabla } from "../utils/sheet";
import { llenarListas } from "../utils/config";
import { pgEvent } from "../utils/pgEvent";
import { appController } from "../appController";
const tab = window.tabEl;

export class UserSettings {
  constructor(settings, dataTableView) {
    this.settings = settings;
    this.dataTableView = dataTableView;
  }
  save() {
    // Realizar las acciones necesarias antes de guardar
    state.timer = false;
    // Simular el comportamiento de stopTimer
    const timerElement = document.querySelector("timer-menu");
    if (timerElement) {
      timerElement.stopTimer();
    }

    // Guardar el estado
    pgEvent.postEvent("STATE", "", [], this.settings);
  }

  reset() {
    // Obtén el elemento sheet-el con id="2"
    const sheetElement = document.querySelector('sheet-el[id="2"]');

    // Si el elemento existe, bórralo
    if (sheetElement) {
      sheetElement.remove();
    }

    // Obtén el elemento sheet-button con id="button2"
    const sheetButtonElement = document.querySelector(
      'sheet-button[id="button2"]'
    );

    // Si el elemento existe, bórralo
    if (sheetButtonElement) {
      sheetButtonElement.remove();
    }

    // Restablecer el estado
    state.seleccionTablaDinamica.filas = [];
    state.seleccionTablaDinamica.columnas = [];
    state.seleccionTablaDinamica.valores = [];
    state.seleccionTablaDinamica.ejercicioCompletado = false;
    state.seleccion.intervalo = "";
    appController.userSettings.settings.ejercicioCompletado = false;
    appController.userSettings.settings.filas = [];
    appController.userSettings.settings.columnas = [];
    appController.userSettings.settings.valores = [];
    appController.userSettings.settings.intervalo = "";
    appController.userSettings.settings.conversationHistory = [];
    tab.conversationHistory = [];
    tab.hasLoadedHistory = false;
    appController.userSettings.settings.conversationHistory = [];

    // pgEvent.onFailEvent("Se ha reseteado el ejercicio", []);
    pgEvent.postEvent("FAILURE", "", [], "");

    // Obtén el div dentro del botón correspondiente a la hoja de datos
    const dataSheetButtonDiv = document.querySelector(
      'sheet-button[id="button1"] div'
    );

    // Si el div existe, simula un clic en él
    if (dataSheetButtonDiv) {
      dataSheetButtonDiv.click();
    }

    tab.render();
    tab.setupEventListeners();
  }

  init() {
    const {
      intervalo,
      filas,
      columnas,
      valores,
      conversationHistory,
      ejercicioCompletado,
      firstChangeMade,
    } = this.settings;
    console.log("Los settings de pg son: ", this.settings);

    tab.conversationHistory = conversationHistory;
    state.seleccionTablaDinamica.ejercicioCompletado = ejercicioCompletado;
    state.seleccionTablaDinamica.filas = filas;
    state.firstChangeMade = firstChangeMade;
    state.seleccionTablaDinamica.columnas = columnas;
    state.seleccionTablaDinamica.valores = valores;
    this.dataTableView.seleccion.selectedCellsExtremes = intervalo.split(":");
    this.dataTableView.seleccion.selectedCellsAsComplexRangeString = intervalo;
    this.dataTableView.getSelectedDataCollection();
    crearHojaTabla();
    llenarListas(state.seleccionTablaDinamica);
    state.actualizarIntervaloYRenderizar();
    state.armarTD();
  }
}
