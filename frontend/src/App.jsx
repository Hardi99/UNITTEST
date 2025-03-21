import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Pages
import MenuPage from './pages/MenuPage';
import OrderPage from './pages/OrderPage';
import TrackingPage from './pages/TrackingPage';

// Components
import Navbar from './components/Navbar';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/tracking" element={<TrackingPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 