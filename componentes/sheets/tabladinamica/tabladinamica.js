customElements.define(
  "tabla-dinamica",
  class HeaderElement extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.innerHTML = `
      <div class="container tabla">
        <tabla-dinamica-view></tabla-dinamica-view>
        <data-controls></data-controls>
      </div>
            `;
      const style = document.createElement("style");
      style.innerHTML = `
      .tabla{
        overflow:hidden;
        position:relative;
        background-color:lightblue;
      }
              `;
      this.appendChild(style);
    }
  }
);
