import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Alerts from './Alerts/Alerts';
// import Alerts from './Alerts';

const Dashboard: React.FC = () => (
  <div className="flex h-screen items-center justify-center bg-gray-100">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Dashboard</h1>
      <p className="text-lg text-gray-600 mb-6">Welcome to the device tracking system</p>
      <Link 
        to="/alerts" 
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
      >
        View Alerts
      </Link>
    </div>
  </div>
);

const Navigation: React.FC = () => (
  <nav className="bg-gray-800 text-white shadow-md">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <span className="font-bold text-xl">TrackingSystem</span>
        </div>
        <div className="flex">
          <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">Dashboard</Link>
          <Link to="/alerts" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">Alerts</Link>
        </div>
      </div>
    </div>
  </nav>
);

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-grow bg-gray-50">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/alerts" element={<Alerts />} />
          </Routes>
        </main>
        <footer className="bg-gray-800 text-white py-4">
          <div className="container mx-auto px-4 text-center">
            <p>© {new Date().getFullYear()} Tracking System. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;