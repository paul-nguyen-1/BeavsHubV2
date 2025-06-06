import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { createTheme, MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./styles/index.css";
import "leaflet/dist/leaflet.css";
import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import { Analytics } from "@vercel/analytics/react";
import { Provider } from "react-redux";
import store from "../app/store";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const router = createRouter({ routeTree });

const theme = createTheme({
  colors: {
    primary: [
      "#D73F09",
      "#D73F09",
      "#D73F09",
      "#D73F09",
      "#D73F09",
      "#D73F09",
      "#D73F09",
      "#D73F09",
      "#D73F09",
      "#D73F09",
    ],
  },
  primaryColor: "primary",
  white: "#F9FAFB",
  fontFamily: "'Open Sans', sans-serif",
  headings: {
    fontFamily: "'Open Sans', sans-serif",
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "2.125rem", lineHeight: "1.3" },
      h2: { fontSize: "1.75rem", lineHeight: "1.3" },
    },
  },
});

const queryClient = new QueryClient();
const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MantineProvider theme={theme}>
            <RouterProvider router={router} />
            <Analytics />
          </MantineProvider>
        </QueryClientProvider>
      </Provider>
    </StrictMode>
  );
}
