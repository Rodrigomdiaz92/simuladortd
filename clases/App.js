export class App {
  constructor(dataTableController, baseSettings) {
    this.itemsToComplete =
      baseSettings.filaSeleccionadaTD?.length +
      baseSettings.columnaSeleccionadaTD?.length +
      baseSettings.valorSeleccionadaTD?.length +
      baseSettings.funcionesSeleccionadasTD?.length;
    this.dataTableController = dataTableController;
    this.baseSettings = baseSettings;
    this.removeLoader();
    this.setInitialConfig();
  }
  removeLoader() {
    const loader = document.querySelector("loader-el");
    loader.querySelector(".loader").classList.toggle("hidden");
    loader.remove();
  }
  setInitialConfig() {
    const { graphEnabled, pivotEnabled, selectionRequirements } =
      this.baseSettings;
    //Deshabilita grafico o tabla
    if (!graphEnabled) {
      const buttonGrafico = document.getElementById("crear-grafico-button");
      buttonGrafico.disabled = true;
    }
    if (!pivotEnabled) {
      const buttonTabla = document.getElementById("crear-tabla-dinamica");
      buttonTabla.disabled = true;
    }
    //Aplica requisitos de seleccion
    this.dataTableController.view.setSelectionRequirements(
      selectionRequirements
    );
  }
  startEvents() {
    this.dataTableController.updateView();
    this.dataTableController.view.setearEventos();
  }
  addProgressToProgressBar() {
    console.log("añadiendo progreso");
    document.dispatchEvent(new CustomEvent("aumentar-progress"));
  }
  subProgressToProgressBar() {
    document.dispatchEvent(new CustomEvent("disminuir-progress"));
  }
}
