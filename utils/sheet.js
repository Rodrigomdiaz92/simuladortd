import { unpaintAllButtons } from "./tab";
export function crearHojaTabla() {
  if (hayElementos("tabla-dinamica")) {
    return;
  }
  //crear nueva pagina y boton dentro del tab de paginas
  const nuevaPagina = document.createElement("sheet-el");
  const containerBotonesPages = document.querySelector(
    ".sheets-bar-content__container.pages div"
  );
  const index = containerBotonesPages.children.length;
  const paginaAnterior = document.getElementById("content-container" + index);
  nuevaPagina.id = index + 1;
  nuevaPagina.type = "tabla-dinamica";
  const nuevaTabla = document.createElement("tabla-dinamica");
  const nuevoBoton = document.createElement("sheet-button");
  nuevoBoton.textContent = "Mi Tabla dinamica";
  nuevoBoton.id = "button" + (index + 1);
  unpaintAllButtons();
  nuevoBoton.classList.add("selected");
  containerBotonesPages.appendChild(nuevoBoton);
  paginaAnterior.parentElement.insertAdjacentElement("afterend", nuevaPagina);
  // Oculta todas las pestañas
  let tabs = document.getElementsByClassName("content-container");
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("selected");
  }
  // Muestra la pestaña seleccionada
  let selectedTab = document.getElementById("content-container" + (index + 1));
  selectedTab.classList.add("selected");
  selectedTab.appendChild(nuevaTabla);
}
export function crearHojaGrafico() {
  if (hayElementos("grafico-el")) {
    return;
  }
  //crear nueva pagina y boton dentro del tab de paginas
  const nuevaPagina = document.createElement("sheet-el");
  const containerBotonesPages = document.querySelector(
    ".sheets-bar-content__container.pages div"
  );
  const index = containerBotonesPages.children.length;
  const paginaAnterior = document.getElementById("content-container" + index);
  console.log(index, paginaAnterior);
  nuevaPagina.id = index + 1;
  const nuevoGrafico = document.createElement("grafico-el");
  const nuevoBoton = document.createElement("sheet-button");
  nuevoBoton.textContent = "Mi gráfico";
  nuevoBoton.id = "button" + (index + 1);
  nuevoBoton.type = "grafico";
  unpaintAllButtons();
  nuevoBoton.classList.add("selected");
  containerBotonesPages.appendChild(nuevoBoton);
  paginaAnterior.parentElement.insertAdjacentElement("afterend", nuevaPagina);
  // Oculta todas las pestañas
  let tabs = document.getElementsByClassName("content-container");
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("selected");
  }
  // Muestra la pestaña seleccionada
  let selectedTab = document.getElementById("content-container" + (index + 1));
  selectedTab.classList.add("selected");
  selectedTab.appendChild(nuevoGrafico);
}

function hayElementos(tag) {
  const elementos = document.querySelectorAll(tag);
  return elementos.length > 0;
}
