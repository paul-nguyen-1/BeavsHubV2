import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createTheme, MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./styles/index.css";
import "@mantine/core/styles.css";

const queryClient = new QueryClient();
const router = createRouter({ routeTree });
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
const theme = createTheme({});
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <RouterProvider router={router} />
        </MantineProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}
