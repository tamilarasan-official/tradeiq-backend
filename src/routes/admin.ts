import { Router } from 'express';

const router = Router();

router.get('/research/export', (_req, res) => {
  res.type('text/csv').send(
    'userId_hash,studyGroup,week,avgExecutionTimeMs,tradesCount,portfolioReturnPct,benchmarkReturnPct,alpha,sharpeRatio,hhi,susScore,platformOS,appVersion\n',
  );
});

export default router;
