import { flatMap, isEmpty } from "lodash";
export function transformData(data, filas, columnas, valores) {
  const flatteredValores = Object.fromEntries(
    valores.map((objeto) => [
      Object.keys(objeto)[0],
      objeto[Object.keys(objeto)[0]],
    ])
  );
  const danfoDf = new dfd.DataFrame(data);
  let grouped;
  try {
    grouped = danfoDf.groupby([...filas, ...columnas]).agg(flatteredValores);
  } catch (error) {
    if (error.message.startsWith("Can't perform math operation on column ")) {
      const columnName = error.message.slice(
        "Can't perform math operation on column ".length
      );
      window.tabEl.handleChat(
        `Los valores en la columna ${columnName} deben ser numericos.`,
        "error"
      );

      // Eliminar la columna no deseada
      danfoDf.drop({ columns: [columnName], inplace: true });

      // Intentar de nuevo la operaci├│n de agrupaci├│n y agregaci├│n
      try {
        grouped = danfoDf
          .groupby([...filas, ...columnas])
          .agg(flatteredValores);
      } catch (error) {
        // Si todavia hay un error, devolver null
        return null;
      }
    } else {
      throw error;
    }
  }
  const transformedData = {
    tabla: grouped,
  };

  return transformedData;
}
export function buildPreview(data) {
  const danfoDf = new dfd.DataFrame(data);
  const transformedData = {
    tabla: danfoDf,
  };

  return transformedData;
}
export function transformValue(value) {
  if (Number.isInteger(value)) {
    return value;
  }
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  return value;
}

export function generateCombinations(arrays, index = 0) {
  if (index === arrays.length - 1) {
    return arrays[index].map((item) => [item]);
  }

  return flatMap(arrays[index], (item) =>
    generateCombinations(arrays, index + 1).map((combination) => [
      item,
      ...combination,
    ])
  );
}

export function getParametrosTablaDinamica(filas, valores, columnas, table) {
  let uniqueColumns;
  let uniqueRows;
  const valuesPositionsInMatrix = valores.map((v) => {
    return {
      valueName: Object.keys(v)[0],
      function: v[Object.keys(v)[0]],
      position: table.headers.indexOf(
        Object.keys(v)[0] + "_" + v[Object.keys(v)[0]]
      ),
    };
  });
  uniqueColumns = getUniqueColumns(table, columnas);
  if (valores.length > 1) {
    uniqueColumns = [
      ...uniqueColumns,
      valores.map((v) => Object.keys(v)[0] + "_" + v[Object.keys(v)[0]]),
    ];
  }
  uniqueRows = getUniqueRows(table, filas);
  if (isEmpty(filas) && valores && columnas) {
    uniqueRows.push(
      valores.map((v) => Object.keys(v)[0] + "_" + v[Object.keys(v)[0]])
    );
  }
  if (isEmpty(columnas) && valores && filas) {
    uniqueColumns.push(
      valores.map((v) => Object.keys(v)[0] + "_" + v[Object.keys(v)[0]])
    );
  }
  return {
    valuesPositionsInMatrix,
    uniqueColumns,
    uniqueRows,
    config: { columns: !isEmpty(columnas), rows: !isEmpty(filas) },
  };
}

export function defineTotalColLength(uniqueColumns, filas, columnas, valores) {
  if (valores.length > 1 && (filas == 0 || columnas == 0)) {
    uniqueColumns.pop();
    return uniqueColumns.reduce((acc, curr) => {
      acc *= curr.length;
      return acc;
    }, 1);
  }
  return uniqueColumns.reduce((acc, curr) => {
    acc *= curr.length;
    return acc;
  }, 1);
}
export function castSpanishOperation(value) {
  if (value == "mean") {
    return "Promedio";
  }
  if (value == "sum") {
    return "Suma";
  }
  if (value == "min") {
    return "Minimo";
  }
  if (value == "max") {
    return "Maximo";
  }
  if (value == "count") {
    return "Conteo";
  }
}
export function getFirstHeader(columnas, valores, filas) {
  let result;
  if (valores.length == 0) {
    return filas.length
      ? [...filas.map(() => ""), ...columnas]
      : [...filas, ...columnas];
  }
  if (columnas.length == 0) {
    return [
      ...filas,
      ...valores.map(
        (v) =>
          `${castSpanishOperation(v[Object.keys(v)[0]])} de ${
            Object.keys(v)[0]
          }`
      ),
    ];
  }
  result =
    valores.length > 1
      ? columnas
      : [
          valores[0] == "--"
            ? ""
            : `${castSpanishOperation(
                valores[0][Object.keys(valores[0])[0]]
              )} de ${Object.keys(valores[0])[0]}`,
          ...columnas,
        ];
  return result;
}
export function cantidadSegunConfig(
  cantidadColumnasAgrupadas,
  cantidadFilasAgrupadas,
  valores,
  totalColumnLength
) {
  let resultado = totalColumnLength;
  if (
    cantidadColumnasAgrupadas == 1 &&
    cantidadFilasAgrupadas == 0 &&
    valores.length == 0
  ) {
    return resultado + 1;
  }
  if (
    cantidadColumnasAgrupadas > 1 &&
    valores.length < 2 &&
    cantidadFilasAgrupadas <= 2
  ) {
    return resultado - 2;
  }
  if (
    cantidadColumnasAgrupadas == 1 &&
    valores.length == 2 &&
    cantidadFilasAgrupadas < 2
  ) {
    return resultado;
  }
  if (cantidadColumnasAgrupadas == 1 && valores.length == 2) {
    return resultado + 1;
  }
  if (cantidadColumnasAgrupadas > 0 && cantidadFilasAgrupadas < 2) {
    return resultado - 1;
  }
  if (
    cantidadColumnasAgrupadas == 0 &&
    cantidadFilasAgrupadas >= 0 &&
    valores.length > 1
  ) {
    return resultado - 2;
  }
  if (cantidadFilasAgrupadas > 0 && cantidadColumnasAgrupadas == 0) {
    return resultado - 1;
  }
  if (
    cantidadColumnasAgrupadas == 1 &&
    cantidadFilasAgrupadas == 1 &&
    valores.length < 2
  ) {
    return resultado - 1;
  }

  return totalColumnLength;
}
function getUniqueColumns(table, columnas) {
  const columnsPositionsInMatrix = columnas.map((c) => {
    return { colName: c, position: table.headers.indexOf(c) };
  });
  return columnsPositionsInMatrix.map((c) => [
    ...new Set(table.data.map((item) => item[c.position])),
  ]);
}
function getUniqueRows(table, filas) {
  const rowsPositionsInMatrix = filas.map((f) => {
    return { rowName: f, position: table.headers.indexOf(f) };
  });
  return rowsPositionsInMatrix.map((f) => [
    ...new Set(table.data.map((item) => item[f.position])),
  ]);
}
export function castResultName(input) {
  const traducciones = {
    sum: "Suma",
    mean: "Promedio",
    count: "Conteo",
    min: "Mínimo",
    max: "Máximo",
    // Agrega más traducciones según sea necesario
  };
  // Dividir la cadena por el carácter de subrayado
  let palabras = input.split("_");

  // Extraer la última palabra y traducirla
  let funcion = palabras.pop();
  let funcionTraducida = traducciones[funcion] || funcion; // Usar la traducción si existe, sino usar la palabra original

  // Reordenar las palabras colocando la función traducida al inicio
  palabras.unshift(funcionTraducida);

  // Unir las palabras en una cadena con espacios
  return palabras.join(" ");
}
