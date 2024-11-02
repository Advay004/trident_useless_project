// src/components/PrivateLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // Assume you have a Navbar component

const PrivateLayout: React.FC = () => {
  return (
    <div>
      <Navbar />  {/* Include the Navbar only for private routes */}
      <div className="content">
        <Outlet />  {/* Renders the child components (private routes) */}
      </div>
    </div>
  );
};

export default PrivateLayout;
