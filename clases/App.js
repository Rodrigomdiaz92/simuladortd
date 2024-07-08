export class App {
  constructor(dataTableController, baseSettings) {
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
}
