export function unpaintAllButtons() {
  const botones = document.querySelectorAll(".sheet-button");
  botones.forEach((btn) => btn.classList.remove("selected"));
}
