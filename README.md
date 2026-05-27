# TradeIQ Backend

Node.js, Express, Socket.IO and MongoDB API shared by the React Native app and Next.js dashboard.

## Run

```bash
cp .env.example .env
npm run dev
```

The API starts on `http://localhost:4000`.

## Implemented Starter Surface

- Auth: register, login, OTP placeholders, MPIN placeholders
- Markets and stock lookup placeholders
- Orders, portfolio, research event, and admin CSV export routes
- MongoDB models for User, Order, Holding, ResearchEvent, and PriceAlert
- Socket.IO placeholder for `subscribe:prices`
