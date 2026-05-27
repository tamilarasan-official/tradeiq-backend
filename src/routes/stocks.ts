import { Router } from 'express';

const router = Router();

const stocks = [
  { symbol: 'RELIANCE', companyName: 'Reliance Industries', ltp: 2850, changePercent: 1.2 },
  { symbol: 'TCS', companyName: 'Tata Consultancy Services', ltp: 4025, changePercent: -0.4 },
  { symbol: 'INFY', companyName: 'Infosys', ltp: 1510, changePercent: 0.7 },
];

router.get('/search', (req, res) => {
  const query = String(req.query.q ?? '').toUpperCase();
  res.json({
    data: stocks.filter(
      stock =>
        stock.symbol.includes(query) ||
        stock.companyName.toUpperCase().includes(query),
    ),
  });
});

router.get('/:symbol', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  res.json({
    data: stocks.find(stock => stock.symbol === symbol) ?? {
      symbol,
      companyName: `${symbol} Limited`,
      ltp: 0,
      changePercent: 0,
    },
  });
});

router.get('/:symbol/chart', (_req, res) => {
  res.json({ data: [] });
});

router.get('/:symbol/fundamentals', (_req, res) => {
  res.json({ data: {} });
});

router.get('/:symbol/news', (_req, res) => {
  res.json({ data: [] });
});

export default router;
