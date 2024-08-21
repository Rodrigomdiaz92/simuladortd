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
  const textoNormalizado = texto.normalize('NFD');
  // Elimina los caracteres diacríticos y otros caracteres especiales
  return textoNormalizado.replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z\s]/g, '');
  }