customElements.define(
  //este es el nombre del elemento, si o si tiene que ir separado por -
  "sheet-el",
  //clase se puede llamar como quieran
  class HeaderElement extends HTMLElement {
    //obligatorio
    constructor() {
      super();
    }

    connectedCallback() {
      this.render();
    }
    addListeners() {}

    render() {
      this.innerHTML = `
          `;
      const style = document.createElement("style");
      style.innerHTML = `

            `;
      this.appendChild(style);
      this.addListeners();
    }
  }
);
