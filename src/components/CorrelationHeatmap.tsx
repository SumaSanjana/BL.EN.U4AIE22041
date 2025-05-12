import { useState, useEffect } from 'react';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { Stock, CorrelationResponse } from '../types';
import { getStockCorrelation } from '../services/api';

interface CorrelationHeatmapProps {
  stocks: Stock[];
}

const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ stocks }) => {
  const [minutes, setMinutes] = useState<number>(30);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [stats, setStats] = useState<{ [key: string]: { avg: number; std: number } }>({});

  useEffect(() => {
    const fetchCorrelations = async () => {
      try {
        const matrix: number[][] = [];
        const statsTemp: { [key: string]: { avg: number; std: number } } = {};

        for (let i = 0; i < stocks.length; i++) {
          const row: number[] = [];

          for (let j = 0; j < stocks.length; j++) {
            if (i === j) {
              row.push(1);
              continue;
            }

            const response: CorrelationResponse = await getStockCorrelation(
              stocks[i].ticker,
              stocks[j].ticker,
              minutes
            );

            const correlation = typeof response.correlation === 'number' && !isNaN(response.correlation) 
              ? response.correlation 
              : 0;
            row.push(correlation);

            if (!statsTemp[stocks[i].ticker]) {
              const prices = response.stocks[stocks[i].ticker].priceHistory.map((p) => p.price);
              const avg = response.stocks[stocks[i].ticker].averagePrice;
              const std = Math.sqrt(
                prices.reduce((sum, p) => sum + (p - avg) ** 2, 0) / prices.length
              );
              statsTemp[stocks[i].ticker] = { avg, std };
            }

            if (!statsTemp[stocks[j].ticker]) {
              const prices = response.stocks[stocks[j].ticker].priceHistory.map((p) => p.price);
              const avg = response.stocks[stocks[j].ticker].averagePrice;
              const std = Math.sqrt(
                prices.reduce((sum, p) => sum + (p - avg) ** 2, 0) / prices.length
              );
              statsTemp[stocks[j].ticker] = { avg, std };
            }
          }

          matrix.push(row);
        }

        const nivoData = stocks.map((stock, i) => ({
          id: stock.ticker,
          data: stocks.map((s, j) => ({
            x: s.ticker,
            y: matrix[i][j],
          })),
        }));

        setHeatmapData(nivoData);
        setStats(statsTemp);
      } catch (error) {
        console.error('Error fetching correlation data:', error);
      }
    };

    fetchCorrelations();
  }, [minutes, stocks]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Correlation Heatmap
      </Typography>

      <FormControl sx={{ minWidth: 120, mb: 2 }}>
        <InputLabel>Time (minutes)</InputLabel>
        <Select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
          {[10, 30, 60, 120].map((min) => (
            <MenuItem key={min} value={min}>
              {min}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div style={{ height: 500 }}>
        <ResponsiveHeatMap
          data={heatmapData}
          margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
          valueFormat={(value) => value.toFixed(4)}
          axisTop={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: '',
            legendOffset: 46,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Stocks',
            legendPosition: 'middle',
            legendOffset: -72,
          }}
          colors={{
            type: 'diverging',
            scheme: 'reds',
            minValue: -1,
            maxValue: 1,
          }}
          emptyColor="#555555"
          tooltip={({ cell }) => (
            <div
              style={{
                background: 'white',
                padding: '5px',
                border: '1px solid #ccc',
              }}
            >
              <strong>{`${cell.data.x} vs ${cell.serieId}`}</strong>
              <br />
              Correlation: {typeof cell.data.y === 'number' ? cell.data.y.toFixed(4) : 'N/A'}
              <br />
              {cell.data.x} Avg Price: {stats[cell.data.x]?.avg.toFixed(2) || 'N/A'}
              <br />
              {cell.data.x} Std Dev: {stats[cell.data.x]?.std.toFixed(2) || 'N/A'}
              <br />
              {cell.serieId} Avg Price: {stats[cell.serieId]?.avg.toFixed(2) || 'N/A'}
              <br />
              {cell.serieId} Std Dev: {stats[cell.serieId]?.std.toFixed(2) || 'N/A'}
            </div>
          )}
        />
      </div>
    </Box>
  );
};

export default CorrelationHeatmap;