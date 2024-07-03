export function getComplexRangeString(
  startRowIndex,
  endRowIndex,
  startColIndex,
  endColIndex,
  table
) {
  const rows = table.rows;
  const cols = table.rows[0].cells;

  const startRowLabel = startRowIndex === 0 ? "" : startRowIndex + 1;
  const endRowLabel = endRowIndex === rows.length - 3 ? "" : endRowIndex + 1;

  const startColLabel = String.fromCharCode(65 + startColIndex);
  const endColLabel = String.fromCharCode(65 + endColIndex);

  return `${startColLabel}${startRowLabel}:${endColLabel}${endRowLabel}`;
}
export function castInterval(intervalo) {
  const splitted = intervalo.split(":");
  if (
    hasOnlyLetters(splitted[0]) &&
    hasOnlyLetters(splitted[0]) &&
    splitted[0] == splitted[1]
  ) {
    return intervalo;
  }
  if (splitted[0] == splitted[1]) {
    return splitted[0];
  }
  return intervalo;
}
function hasOnlyLetters(str) {
  const regex = /^[a-zA-Z]+$/;
  return regex.test(str);
}
