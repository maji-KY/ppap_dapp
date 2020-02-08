import * as React from "react";
import * as ReactDOM from "react-dom";
import { Hmr, startHmr, DefaultTypelessProvider } from "typeless";

// boot App
const containerElement: HTMLElement = document.getElementById("main") as HTMLElement;

const render = () => {
  const AppRoot = require("./AppRoot").AppRoot;
  ReactDOM.unmountComponentAtNode(containerElement);
  ReactDOM.render(
    <Hmr>
      <DefaultTypelessProvider>
        <AppRoot />
      </DefaultTypelessProvider>
    </Hmr>,
    containerElement
  );
};

declare const module: any;
if (module.hot) {
  module.hot.accept("./AppRoot", () => {
    startHmr();
    render();
  });
}

render();
