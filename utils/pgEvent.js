const ID = "id";
import { appController } from "../appController";

export class PgEvent {
  constructor() {
    this.data = {
      type: "blockly-type",
      id: "",
      state: "",
    };
  }

  getValues() {
    const url = document.location.href;
    const paths = url.split("?");
    //console.log(paths)
    if (paths.length < 2) {
      return;
    }

    const queryStrings = paths[1].split("&");
    for (const qs of queryStrings) {
      if (qs.length < 2) {
        continue;
      }

      const values = qs.split("=");
      if (values.length < 2) {
        continue;
      }
      switch (values[0]) {
        case ID:
          this.data[ID] = values[1];
          //console.log(this.data[ID]);
          break;
      }
    }
  }

  postToPg(dataObject) {
    dataObject.type = this.data.type;
    dataObject.id = this.data.id;
    window.top.postMessage(dataObject, "*");
  }

  // Agrega la función aquí
  // postEvent(eventType, message, reasons, state) {
  //   let dataObject;

  //   if (state === undefined || state === null || state === "") {
  //     dataObject = {
  //       event: eventType,
  //       message: message,
  //       reasons: reasons
  //     };
  //   } else {
  //     dataObject = {
  //       event: eventType,
  //       message: message,
  //       reasons: reasons,
  //       state: JSON.stringify({ data: state })
  //     };
  //   }

  //   this.postToPg(dataObject);
  //  }

  postToPg(dataObject) {
    dataObject.type = this.data.type;
    dataObject.id = this.data.id;
    window.top.postMessage(dataObject, "*");
  }

  postEvent(eventType, message, reasons, state) {
    if (eventType === "FAILURE") {
      if (
        appController.userSettings.settings.ejercicioCompletado === undefined ||
        appController.userSettings.settings.ejercicioCompletado === "" ||
        appController.userSettings.settings.ejercicioCompletado === null
      ) {
        state = "";
      } else if (
        appController.userSettings.settings.ejercicioCompletado === false
      ) {
        state = "";
      } else {
        // Caso de que ejercicioCompletado sea true
        appController.userSettings.settings.ejercicioCompletado = false;
        state = appController.userSettings.settings;
      }
    }

    if (eventType === "SUCCESS") {
      state = appController.userSettings.settings;
    }

    const dataObject = {
      event: eventType,
      message: message,
      reasons: reasons,
      state: JSON.stringify({ data: state }),
    };

    this.postToPg(dataObject);
  }

  // onSuccessEvent(message) {
  //   // console.log("El mensaje on success es: ", message);
  //   // console.log("La data de on succes es: ", this.data);
  //   this.data["event"] = "SUCCESS";
  //   this.data["message"] = message;
  //   window.top.postMessage(this.data, "*");
  // }

  // onFailEvent(message, razones) {
  //   // console.log("El mensaje on fail es: ", message, razones);
  //   // console.log("La data de on fail es: ", this.data);
  //   this.data["event"] = "FAILURE";
  //   this.data["message"] = message;
  //   this.data["reasons"] = razones;
  //   window.top.postMessage(this.data, "*");
  // }

  // sendState(state) {
  //   // console.log("El mensaje de state es: ", state);
  //   // console.log("La data de state es: ", this.data);
  //   this.data["event"] = "STATE";
  //   this.data["state"] = state;
  //   window.top.postMessage(this.data, "*");
  // }
}

export const pgEvent = new PgEvent();
