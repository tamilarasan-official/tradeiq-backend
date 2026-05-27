# TradeIQ Functionality and Flow

See the workspace-level `TradeIQ_Functionality_Flow.md` for the full mobile and backend flow.

This backend currently includes:

- Express API server
- MongoDB connection setup
- Auth endpoints
- Dashboard API
- Profile API
- Market and stock endpoints
- Order placement endpoint
- Portfolio endpoints
- Research event endpoints
- Admin CSV export
- Admin MongoDB import endpoints for stocks, indices, holdings, and watchlist
- Render deployment configuration

Dashboard, profile, orders, portfolio, stock search, and market indices now read from MongoDB collections instead of route-level mock arrays.

MongoDB collections used:

- `users`
- `stockquotes`
- `marketindices`
- `watchlistitems`
- `holdings`
- `orders`
- `pricealerts`
- `researchevents`
