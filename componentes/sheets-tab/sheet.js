customElements.define(
  "sheet-el",
  class Sheet extends HTMLElement {
    static type;
    constructor() {
      super();
    }
    connectedCallback() {
      this.type = this.getAttribute("type");
      this.render();
    }
    addListeners() {}

    render() {
      this.innerHTML = `
          <div class="content-container selected" id="content-container${this.id}"></div>
        `;
      const style = document.createElement("style");
      style.innerHTML = `
            .content-container {
              display:none;
              height: 100%;
              
            }
            .content-container.selected{
              display:block;
            }
            
          `;
      this.appendChild(style);
      this.addListeners();
    }
  }
);
