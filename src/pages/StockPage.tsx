import { Box } from '@mui/material';
import StockChart from '../components/StockChart';
import { getStocks } from '../services/api';
import { useEffect, useState } from 'react';
import { Stock } from '../types';

const StockPage: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);

  useEffect(() => {
    const fetchStocks = async () => {
      const data = await getStocks();
      setStocks(data);
    };
    fetchStocks();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      {stocks.length > 0 && <StockChart stocks={stocks} />}
    </Box>
  );
};

export default StockPage;