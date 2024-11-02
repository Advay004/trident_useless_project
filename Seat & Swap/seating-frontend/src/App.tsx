import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AddStudent from './pages/AddStudent';
import BenchLayout from './pages/BenchLayout';
import StudentProfile from './pages/StudentProfile';
import { getAccessToken } from './api/authService'; // Import the function to check tokens
import Login from './pages/Login';
import PrivateLayout from './components/PrivateLayout'; // Import the new PrivateLayout
import RollNumberSelector from './pages/RollNumberSelector';

// Function to check if user is authenticated
const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  console.log('Access Token:', token); // Debugging log to check if the token is being retrieved correctly
  return !!token; // Return true if there is an access token
};

// Private Route component to protect routes
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = isAuthenticated();
  return auth ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" /> // Redirect to login if not authenticated
  );
};

const RollNumberRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storedRollNo = localStorage.getItem('my-roll-no');
  const isRollNumberSelected = storedRollNo !== null;

  return isRollNumberSelected ? (
    <>{children}</> 
  ) : (
    <Navigate to="/select-roll-no" />
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Home page is public and does not require login */}
          <Route path="/" element={
            <RollNumberRoute>
              <Home />
            </RollNumberRoute>
            } />

        {/* For selecting roll Number */}
        <Route path="/select-roll-no" element={<RollNumberSelector/>} />
        
        {/* Login route */}
        <Route path="/login" element={<Login />} />

        {/* Private routes wrapped in PrivateLayout */}
        <Route
          element={
            <PrivateRoute>
              <PrivateLayout />
            </PrivateRoute>
          }
        >
          <Route path="/students" element={<AddStudent />} />
          <Route path="/bench-layout" element={<BenchLayout />} />
          <Route path="/student-profile/:studentId" element={<StudentProfile />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
