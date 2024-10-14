export function castFunction(name) {
  const traducciones = {
    sum: "Suma",
    mean: "Promedio",
    count: "Conteo",
    min: "Mínimo",
    max: "Máximo",
    // Agrega más traducciones según sea necesario
  };
  return traducciones[name];
}
export function quitarAcentosYCaracteresEspeciales(texto) {
  // Normaliza el texto a forma descompuesta
  const textoNormalizado = texto.normalize("NFD");
  // Elimina los caracteres diacríticos y otros caracteres especiales
  return textoNormalizado
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z\s]/g, "");
}
//Validaciones de arrays y textos
export function validarTexto(texto) {
  //Formatea strings con caracteres extraños (ñ,´)
  const regex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
  return regex.test(texto);
}
export function limpiarArrayTexto(array) {
  const regex = /[^a-zA-ZñÑáéíóúÁÉÍÓÚ\s]/g;
  // Recorre el array y limpia cada string
  return array.map((texto) => texto.replace(regex, ""));
}
export function ordenarAlfabeticamente(array) {
  // Verificamos si el valor recibido es un array
  if (!Array.isArray(array)) {
    console.error("El argumento no es un array:", array);
    return []; // O lanza un error si prefieres: throw new TypeError("El argumento debe ser un array.");
  }

  // Verificamos que el array no esté vacío
  if (array.length === 0) {
    return array;
  }

  // Ordena alfabéticamente de forma ascendente
  return array.sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
}


export function arraysIguales(array1, array2) {
  console.log("entro a arrays iguales");
  if (array1.length !== array2.length) {
    return false;
  }
  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }
  return true;
}
