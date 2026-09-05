import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AuthProvider from "./auth/AuthProvider.jsx";
import ConfirmationProvider from './components/ConfirmationProvider.jsx';
import { ToastContainer } from "react-toastify";

import { Tooltip } from "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";

import App from "./App.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// bootstrap tooltip delegation
new Tooltip(document.body, {
  selector: '[data-bs-toggle="tooltip"]',
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ConfirmationProvider>
            <App />
            <ToastContainer
              position="top-right"
              autoClose={4000}
              newestOnTop
              closeOnClick
              pauseOnFocusLoss
              pauseOnHover
              draggable
              theme="colored"
              limit={4}
            />
          </ConfirmationProvider>

        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
