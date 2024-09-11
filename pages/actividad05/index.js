import { DataTable } from "../../clases/DataTable";
import { DataTableView } from "../../clases/DataTableView";
import { DataTableController } from "../../clases/DataTableController";
import { pgEvent } from "../../utils/pgEvent"; // Importar PgEvent
import "../../componentes/menu/menu";
import "../../componentes/menu/archivo-menu";
import "../../componentes/menu/reloj";
import "../../componentes/loader";
import "../../componentes/sheets-tab/sheet";
import "../../componentes/sheets-tab/sheet-button";
import "../../componentes/sheets-tab/tab";
import "../../componentes/sheets/grafico";
import "../../componentes/sheets/tabladinamica/tabladinamica";
import "../../componentes/sheets/tabladinamica/tabla-dinamica-view";
import "../../componentes/sheets/tabladinamica/data-controls";
import { App } from "../../clases/App";
import { UserSettings } from "../../clases/UserSettings";
import { appController } from "../../appController";

const BASE_SETTINGS = {
  datasetURL:
    "https://script.google.com/macros/s/AKfycbyVWmRM9YzbbNdyYl8pC9oIjANFGjeTKremWPfN3swHBTQpMzvdP51InEtlLE6HK1lgSw/exec",
  graphEnabled: true,
  pivotEnabled: false,
  selectionRequirements: { minRows: 5, minCols: 5 },
  tipoGrafico: "barras",
  ejeX: "HABILIDAD_ATAQUE",
  serie: ["EDAD"],
  funcion: "promedio",
  escala:100,
};
let df;
window.onload = pgEvent.getValues();
//Capaz hay que darle una vuelta a esto para delegarselo a App
//Traer los datos del sheet
async function fetchDataframe() {
  const res = await fetch(BASE_SETTINGS.datasetURL);
  const dat = await res.json();
  return dat.datos;
}
//Transformar a dataframe usando DanfoJS
async function initializeDf() {
  const datos = await fetchDataframe();
  df = new dfd.DataFrame(datos);
}

//Inicializa todo
async function main() {
  let informacion;

  ////////////////////////////////////////////////////////////////
  window.addEventListener("message", function (event) {
    if (isValidInitialEvent(event)) {
      //console.log("La informacion guardada 1 es: ", event);
      informacion = event.data.data; // Asignar event.data a informacion
      //console.log("La informacion guardada 2 es: ", informacion);
    }
  });

  const isValidInitialEvent = (event) => {
    return (
      event?.data?.data &&
      event?.data?.type === "init" &&
      typeof event.data.data == "string"
    );
  };

  const validateJson = (json) => {
    try {
      return !!JSON.parse(json);
    } catch (error) {
      console.error("Invalid provided json:", error.message);
      return null;
    }
  };

  await initializeDf();
  // Crear instancias de tablas para luego pasarselo a objeto App, que controlaría todo
  const dataTable = new DataTable(df);
  const dataTableView = new DataTableView("content-container1");
  window.dataTableView = dataTableView;
  const dataTableController = new DataTableController(dataTable, dataTableView);
  appController.app = new App(dataTableController, BASE_SETTINGS);
  appController.app.startEvents();
  const USER_SETTINGS_DEFAULT = {
    intervalo: "",
    filas: [],
    columnas: [],
    valores: [],
    conversationHistory: [],
  };
  const parsedJSONfromPG = validateJson(informacion)
    ? JSON.parse(informacion)
    : {};
  //console.log(parsedJSONfromPG);

  if (
    parsedJSONfromPG.data !== "not-started" &&
    parsedJSONfromPG.data !== "" &&
    parsedJSONfromPG.data !== null &&
    parsedJSONfromPG.data !== undefined
  ) {
    //console.log("vengo de PG");

    parsedJSONfromPG.data.intervalo = parsedJSONfromPG.data.intervalo;
    appController.userSettings = new UserSettings(
      parsedJSONfromPG.data,
      dataTableView
    );
    appController.userSettings.default = USER_SETTINGS_DEFAULT;
    appController.userSettings.init();
  } else {
    appController.userSettings = new UserSettings(
      USER_SETTINGS_DEFAULT,
      dataTableView
    );
    appController.userSettings.default = USER_SETTINGS_DEFAULT;
    // Al comentar la siguiente línea, se evita que se inicialice con los valores por defecto en la tabla dinámica
    // appController.userSettings.init();
  }
}
main();
