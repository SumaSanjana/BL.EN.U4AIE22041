import dotenv from 'dotenv';
dotenv.config(); // Load .env variables
import express from 'express';
import { getAverageStockPrice, getStockCorrelation } from './controllers/stockController';

const app = express();
app.use(express.json());

app.get('/stocks/:ticker', getAverageStockPrice);
app.get('/stockcorrelation', getStockCorrelation);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});