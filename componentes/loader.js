customElements.define(
  //este es el nombre del elemento, si o si tiene que ir separado por -
  "loader-el",
  //clase se puede llamar como quieran
  class HeaderElement extends HTMLElement {
    //obligatorio
    constructor() {
      super();
    }

    connectedCallback() {
      this.render();
    }
    render() {
      this.innerHTML = `
        <div class=${"loader " + this.className}></div>
            `;
      const style = document.createElement("style");
      style.innerHTML = `
        .loader{
            position:fixed;
            top:0;
            left:0;
            width:100%;
            height:100%;
            display:flex;
            justify-content:center;
            align-items:center;
            transition: opacity 0.75s, visibility 0.75s;
        }
        .loader.hidden{
            display:none;
        }
        .loader::after{
            content:"";
            width:75px;
            height:75px;
            border:15px solid #3f3f3f;
            border-top-color:#ffc51a;
            border-radius:50%;
            animation:loading 0.75s ease infinite;
        }
        @keyframes loading{
            from{
                transform:rotate(0turn)
            }
            to{
                transform:rotate(1turn)
            }
        }
              `;
      this.appendChild(style);
    }
  }
);
