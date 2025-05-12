import { Box } from '@mui/material';
import CorrelationHeatmap from '../components/CorrelationHeatmap';
import { getStocks } from '../services/api';
import { useEffect, useState } from 'react';
import { Stock } from '../types';

const CorrelationPage: React.FC = () => {
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
      {stocks.length > 0 && <CorrelationHeatmap stocks={stocks} />}
    </Box>
  );
};

export default CorrelationPage;