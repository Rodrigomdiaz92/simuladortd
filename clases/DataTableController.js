// Controlador
export class DataTableController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  updateView() {
    this.view.renderTable(this.model);
  }
}
