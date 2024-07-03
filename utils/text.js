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
