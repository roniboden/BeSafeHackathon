import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css'; 
import Dashboard from './Dashboard.jsx'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>
);