import { ColorModeScript, ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import { NotificationContainer } from 'react-notifications';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <ChakraProvider>
    <ColorModeScript />
    <div className="min-h-screen flex items-center justify-center">
      <App />
      <NotificationContainer />
    </div>
  </ChakraProvider>
);
