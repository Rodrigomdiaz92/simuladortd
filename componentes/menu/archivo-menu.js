import { appController } from "../../appController";
import swal from "sweetalert";
customElements.define(
  "archivo-menu",
  class ArchivoMenu extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.render();
    }
    addListeners() {
      //Abrir el menu
      const menuButton = this.querySelector("#menu");
      const contenido = this.querySelector(".contenido-menu");
      menuButton.addEventListener("click", () => {
        if (contenido.style.display == "none") {
          contenido.style.display = "block";
          return;
        }
        contenido.style.display = "none";
      });
      //Cerrar ante cualquier click fuera
      document.addEventListener("click", (event) => {
        const isClickInsideMenu =
          menuButton.contains(event.target) || contenido.contains(event.target);
        if (!isClickInsideMenu) {
          contenido.style.display = "none"; // Ocultar el menú si se hace clic fuera de él
        }
      });
      const saveButton = this.querySelector("#guardar-button");
      saveButton.addEventListener("click", (e) => {
        const sheetButtonElement = document.querySelector('sheet-button[id="button2"]');

        // Si no hay creada una tabla dinamica no se puede guardar
        if (!sheetButtonElement){
          swal({
        title: "Error",
        text: "No se puede guardar si no se ha creado una tabla dinámica.",
        icon: "error",
          });
          return;
        }
        e.stopImmediatePropagation();
        swal({
          title: "Guardado completado",
          text: "Se han guardado los cambios correctamente.",
          icon: "success",
        }).then(() => {
          appController.userSettings.save();
        });
      });
      const resetButton = this.querySelector("#reset-button");
      resetButton.addEventListener("click", (e) => {
        e.stopImmediatePropagation();
        swal({
          title: "¿Seguro que quieres reiniciar esta hoja?",
          text: "El ejercicio volverá a su estado original",
          buttons: ["Cancelar", "Aceptar"],
          dangerMode: true,
        }).then((willReset) => {
          if (willReset) {
            appController.userSettings.settings = appController.userSettings.default;
            appController.userSettings.reset();
            //Se comenta para que el reset no inicialice el data controls
            //appController.userSettings.init();
          }
        });
      });
    }

    render() {
      this.innerHTML = `
        <div id="menu">
        <button>
          <p>Archivo</p>
        </button>
        <div class="contenido-menu">
            <button disabled>Nuevo</button>
            <button disabled>Abrir</button>
            <button disabled>Importar</button>
            <button id="guardar-button">Guardar</button>
            <button id="reset-button">Reestablecer al original</button>
        </div>
    </div>
    `;
      this.addListeners();
    }
  }
);
