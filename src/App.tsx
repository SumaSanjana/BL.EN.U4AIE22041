import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import StockPage from './pages/StockPage';
import CorrelationPage from './pages/CorrelationPage';
import { theme } from './theme';
import './styles.css';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<StockPage />} />
          <Route path="/correlation" element={<CorrelationPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;