import { appController } from "../../appController";

class Tab extends HTMLElement {
  constructor() {
    super();
    this.conversationHistory = [];
    this.userMessage = null;
    this.API_KEY = "PASTE-YOUR-API-KEY";
    this.hasLoadedHistory = false;
    this.floatingMessageQueue = [];
  }
  connectedCallback() {
    this.render();
    this.setupEventListeners();
    window.tabEl = this; // Guarda una referencia a tab-el en window
  }

  setupEventListeners() {
    this.chatbotToggler = this.querySelector(".chatbot-toggler");
    this.closeBtn = this.querySelector(".close-btn");
    this.chatbox = this.querySelector(".chatbox");
    this.chatInput = this.querySelector(".chat-input textarea");
    this.sendChatBtn = this.querySelector(".chat-input span");

    this.inputInitHeight = this.chatInput.scrollHeight;

    this.chatInput.addEventListener("input", this.adjustInputHeight.bind(this));
    this.chatInput.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.sendChatBtn.addEventListener("click", this.handleChat.bind(this));
    this.closeBtn.addEventListener("click", () =>
      document.body.classList.remove("show-chatbot")
    );
    this.chatbotToggler.addEventListener("click", () => {
      document.body.classList.toggle("show-chatbot");
      if (!this.hasLoadedHistory) {
        // Comprueba si ya se ha cargado el historial
        this.loadConversationHistory();
        this.hasLoadedHistory = true; // Marca el historial como cargado
      }
    });
  }

  loadConversationHistory() {
    // Cargar el historial de conversación
    this.conversationHistory =
      appController.userSettings.settings.conversationHistory;
    this.conversationHistory.forEach((item) => {
      const chatMessage = this.createChatLi(
        item.message,
        "incoming",
        item.status
      );
      this.chatbox.appendChild(chatMessage);
    });
    this.chatbox.scrollTo(0, this.chatbox.scrollHeight);
  }

  addListeners() {
    this.addEventListener("tab-deleted", (e) => {
      const botonAPintar = this.querySelector(
        `div#button${e.detail.numeroDeId - 1}`
      );
      if (botonAPintar) {
        botonAPintar.click();
      }
    });
  }
  adjustInputHeight() {
    // Ajustar la altura del textarea de entrada en función de su contenido
    this.chatInput.style.height = `${this.inputInitHeight}px`;
    this.chatInput.style.height = `${this.chatInput.scrollHeight}px`;
  }

  handleKeyDown(e) {
    // Si se presiona la tecla Enter sin la tecla Shift y el ancho de la ventana
    // es mayor que 800px, manejar el chat
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
      e.preventDefault();
      this.handleChat();
    }
  }

  handleChat(message, status) {
    if (!this.hasLoadedHistory) {
      this.loadConversationHistory();
      this.hasLoadedHistory = true;
    }

    const thinkingMessage = this.createChatLi("...", "incoming", status);
    this.chatbox.appendChild(thinkingMessage);
    this.chatbox.scrollTo(0, this.chatbox.scrollHeight);

    const timestamp = new Date();
    const formattedTimestamp = timestamp.toLocaleString("es-ES");
    this.conversationHistory.push({
      message,
      timestamp: formattedTimestamp,
      status,
    });
    appController.userSettings.settings.conversationHistory =
      this.conversationHistory;

    setTimeout(() => {
      this.chatbox.removeChild(thinkingMessage);
      const chatMessage = this.createChatLi(message, "incoming", status);
      this.chatbox.appendChild(chatMessage);
      this.chatbox.scrollTo(0, this.chatbox.scrollHeight);

      if (!document.body.classList.contains("show-chatbot")) {
        // Añade el mensaje a la cola en lugar de mostrarlo inmediatamente
        this.floatingMessageQueue.push({ message, status });
        // Comienza a procesar la cola si no se está procesando ya
        if (!this.isProcessingQueue) {
          this.processFloatingMessageQueue();
        }
      }
    }, 1000);
  }

  processFloatingMessageQueue() {
    if (this.floatingMessageQueue.length > 0) {
      this.isProcessingQueue = true;
      const { message, status } = this.floatingMessageQueue.shift();
      const floatingMessage = document.createElement("div");
      floatingMessage.textContent = message;
      floatingMessage.style.position = "fixed";
      floatingMessage.style.bottom = "120px";
      floatingMessage.style.right = "20px";
      floatingMessage.style.padding = "15px";
      floatingMessage.style.backgroundColor =
        status === "error"
          ? "#f44336"
          : status === "warning"
          ? "#FFA500"
          : "#4CAF50";
      floatingMessage.style.border = "none";
      floatingMessage.style.borderRadius = "10px";
      floatingMessage.style.color = "#fff";
      floatingMessage.style.fontSize = "16px";
      floatingMessage.style.zIndex = "1000";
      document.body.appendChild(floatingMessage);

      setTimeout(() => {
        document.body.removeChild(floatingMessage);
        // Procesa el siguiente mensaje en la cola después de un retraso de 2.5 segundos
        setTimeout(() => {
          this.processFloatingMessageQueue();
        }, 400);
      }, 2000);
    } else {
      this.isProcessingQueue = false;
    }
  }

  createChatLi(message, className, status) {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);

    let chatContent =
      className === "outgoing"
        ? `
        <p></p>    
        `
        : `<img class="andy-icon" src="${this.imgSrc}" alt="Andy"><p></p>`;
    chatLi.innerHTML = chatContent;

    const chatP = chatLi.querySelector("p");
    chatP.textContent = message;

    // Change the background color of the chat message based on the status
    chatP.style.backgroundColor = "lightgray";
    if (className == "outgoing") {
      return chatLi;
    }
    chatP.style.borderRight = "3px solid";
    chatP.style.borderColor =
      status === "error"
        ? "#f44336"
        : status === "warning"
        ? "#FFA500"
        : "#4CAF50";
    return chatLi;
  }

  // const imageContainer = this.querySelector("#contenedor-imagen");
  // imageContainer.classList.remove("error");

  getConversationHistory() {
    return this.conversationHistory;
  }

  render() {
    this.imgSrc = new URL(
      "../../assets/DSD_2022_-_DEPRECADO_-_Template_Amarillo_Contenidos_Schools__by_Lucho_-removebg-preview.png",
      import.meta.url
    ).href;
    this.innerHTML = `
        <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .chatbot-toggler {
          position: fixed;
          bottom: 33.2px;
          right: 35px;
          outline: none;
          border: none;
          height: 50px;
          width: 50px;
          display: flex;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
          z-index: 1000;
          background: transparent;
        }
        body.show-chatbot .chatbot-toggler {
          transform: scale(0.5);  /* Achica el robot a la mitad de su tamaño original */
        }
        .chatbot-toggler span {
          color: #fff;
          position: absolute;
        }
        .chatbot-toggler span:last-child,
        body.show-chatbot .chatbot-toggler span:first-child  {
          opacity: 0;
        }
        body.show-chatbot .chatbot-toggler span:last-child {
          opacity: 1;
        }
        .chatbot {
          position: fixed;
          right: 35px;
          bottom: 90px;
          width: 420px;
          background: #fff;
          border-radius: 15px;
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
          transform: scale(0.5);
          transform-origin: bottom right;
          box-shadow: 0 0 128px 0 rgba(0,0,0,0.1),
                      0 32px 64px -48px rgba(0,0,0,0.5);
          transition: all 0.1s ease;
          z-index: 1000;  /* Asegura que el chatbot este siempre en primer plano */
        }
        
        body.show-chatbot .chatbot {
          opacity: 1;
          pointer-events: auto;
          transform: scale(1);
        }
        .chatbot header {
          padding: 16px 0;
          position: relative;
          text-align: center;
          color: #fff;
          background: #333;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .chatbot header span {
          position: absolute;
          right: 15px;
          top: 50%;
          display: none;
          cursor: pointer;
          transform: translateY(-50%);
        }
        header h2 {
          font-size: 1.4rem;
        }
        .chatbot .chatbox {
          overflow-y: auto;
          height: 250px;
          padding: 30px 20px 100px;
        }
        .chatbot :where(.chatbox, textarea)::-webkit-scrollbar {
          width: 6px;
        }
        .chatbot :where(.chatbox, textarea)::-webkit-scrollbar-track {
          background: #fff;
          border-radius: 25px;
        }
        .chatbot :where(.chatbox, textarea)::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 25px;
        }
        .chatbox .chat {
          display: flex;
          list-style: none;
          margin-bottom: 10px;  /* Agrega un margen en la parte inferior de cada mensaje */
        }
        .chatbox .outgoing {
          margin: 20px 0;
          justify-content: flex-end;
        }
        .chatbox .incoming img {
          width: 50px;  /* Ancho fijo */
          height: 50px;  /* Altura fija */
          object-fit: cover;  
        }
        .chatbox .incoming span {
          width: 32px;
          height: 32px;
          color: #fff;
          cursor: default;
          text-align: center;
          line-height: 32px;
          align-self: flex-end;
          background: #724ae8;
          border-radius: 4px;
          margin: 0 10px 7px 0;
        }
        .chatbox .chat p {
          white-space: pre-wrap;
          padding: 12px 16px;
          border-radius: 10px 10px 0 10px;
          max-width: 75%;
          color: #fff;
          font-size: 0.95rem;
          background: #724ae8;
        }
        .chatbox .incoming p {
          border-radius: 10px 10px 10px 0;
        }
        .chatbox .chat p.error {
          color: #721c24;
          background: #f8d7da;
        }
        .chatbox .incoming p {
          color: #000;
          background: #d0d0d0;
        }
        .chatbot .chat-input {
          display: flex;
          gap: 5px;
          position: absolute;
          bottom: 0;
          width: 100%;
          background: #fff;
          padding: 3px 20px;
          border-top: 1px solid #ddd;
        }
        .chat-input textarea {
          height: 55px;
          width: 100%;
          border: none;
          outline: none;
          resize: none;
          max-height: 180px;
          padding: 15px 15px 15px 0;
          font-size: 0.95rem;
        }
        .chat-input span {
          align-self: flex-end;
          color: #724ae8;
          cursor: pointer;
          height: 55px;
          display: flex;
          align-items: center;
          visibility: hidden;
          font-size: 1.35rem;
        }
        .chat-input textarea:valid ~ span {
          visibility: visible;
        }
        .andy-icon {
          width: 25px;  /* Ancho fijo */
          height: 25px;  /* Altura fija */
          object-fit: cover;  
        }
        @media (max-width: 490px) {
          .chatbot-toggler {
            right: 20px;
            bottom: 20px;
          }
          .chatbot {
            right: 0;
            bottom: 0;
            height: 100%;
            border-radius: 0;
            width: 100%;
          }
          .chatbot .chatbox {
            height: 90%;
            padding: 25px 15px 100px;
          }
          .chatbot .chat-input {
            padding: 5px 15px;
          }
          .chatbot header span {
            display: block;
          }
        }

        </style>
        <div class="pages-bar__container">
          <div class="sheets-bar-content__container pages">
            <sheet-button class="selected" id="button1">Datos</sheet-button>
          </div>
          <button class="chatbot-toggler">
            <img src="${this.imgSrc}" alt="Andy" style="width: 180px;">
            <span class="material-symbols-rounded"></span>
            <span class="material-symbols-outlined">close</span>
          </button>
          <div class="chatbot">
            <header>
              <h2>Andy</h2>
              <span class="close-btn material-symbols-outlined"></span>
            </header>
            <ul class="chatbox">
              <li class="chat incoming">
                <img src="${this.imgSrc}">
                <p>Hola, que tal? ­<br>Como puedo ayudarte?</p>
              </li>
            </ul>
            <div class="chat-input">
              <textarea placeholder="Enter a message..." spellcheck="false" required></textarea>
              <span id="send-btn" class="material-symbols-rounded">send</span>
            </div>
          </div>
        </div>
      `;
  }
}
export { Tab };
customElements.define("tab-el", Tab);
