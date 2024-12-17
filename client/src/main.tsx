import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./styles/index.css";
import "./styles/output.css";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <MantineProvider>
        <RouterProvider router={router} />
      </MantineProvider>
    </StrictMode>
  );
}
