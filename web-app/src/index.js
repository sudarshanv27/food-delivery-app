import React from 'react';
import ReactDOM from 'react-dom/client';

import { QueryClient, QueryClientProvider } from 'react-query';

import { Toaster } from 'react-hot-toast';

import App from './App';

import './styles/index.css';

import { CartProvider } from './context/CartContext';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
    document.getElementById('root')
);

root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <CartProvider>
                <App />
                <Toaster position="top-right" />
            </CartProvider>
        </QueryClientProvider>
    </React.StrictMode>
);