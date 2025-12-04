import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Import Redux Provider and store
import { Provider } from 'react-redux';
import { store } from './app/store'; 

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    {/* Wrap the App component with the Redux Provider */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);