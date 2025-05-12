import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { AverageStockResponse, Stock } from '../types';
import { getAverageStockPrice } from '../services/api';

interface StockChartProps {
  stocks: Stock[];
}

const StockChart: React.FC<StockChartProps> = ({ stocks }) => {
  const [ticker, setTicker] = useState<string>(stocks[0]?.ticker || '');
  const [minutes, setMinutes] = useState<number>(30);
  const [data, setData] = useState<AverageStockResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAverageStockPrice(ticker, minutes);
        setData(response);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };
    fetchData();
  }, [ticker, minutes]);

  const chartData = data?.priceHistory.map((entry) => ({
    time: new Date(entry.lastUpdatedAt).toLocaleTimeString(),
    price: entry.price,
  }));

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Stock Price Chart
      </Typography>
      <FormControl sx={{ minWidth: 120, mr: 2 }}>
        <InputLabel>Stock</InputLabel>
        <Select value={ticker} onChange={(e) => setTicker(e.target.value)}>
          {stocks.map((stock) => (
            <MenuItem key={stock.ticker} value={stock.ticker}>
              {stock.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Time (minutes)</InputLabel>
        <Select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
          {[10, 30, 60, 120].map((min) => (
            <MenuItem key={min} value={min}>
              {min}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {data && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Average Price: ${data.averageStockPrice.toFixed(2)}
          </Typography>
          <LineChart width={600} height={400} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="price" stroke="#8884d8" />
            <Line
              type="monotone"
              dataKey={() => data.averageStockPrice}
              stroke="#ff7300"
              strokeDasharray="5 5"
              name="Average Price"
            />
          </LineChart>
        </>
      )}
    </Box>
  );
};

export default StockChart;