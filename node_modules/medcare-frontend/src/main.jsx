import React from 'react';
import ReactDOM from 'react-dom/client';

import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import Cursor from "./components/Cursor";
import "./index.css";

import App from './App';
import 'leaflet/dist/leaflet.css'; // 🔥 important for map

// 🔥 React Query Setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount) => failureCount < 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// 🔥 Root Render
const root = document.getElementById('root');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>

        <App />

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#041426',
              color: '#f0f4f8',
              border: '1px solid rgba(0,212,180,0.3)',
              borderRadius: '14px',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
            },
            success: {
              iconTheme: {
                primary: '#00d4b4',
                secondary: '#020b18',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff4d6d',
                secondary: '#020b18',
              },
            },
          }}
        />

          <Cursor />

      </BrowserRouter>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);