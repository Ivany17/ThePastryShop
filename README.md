# ThePastryShop (Charodiya)

Online store for confectionery products. Full-stack learning project: a REST API on ASP.NET Core and a plain JavaScript frontend. **In development.**

## Features

- Product catalog with search and category filtering (All, Cakes, Pastries, Cookies)
- Admin panel: add, edit and delete products with input validation
- Shopping cart: change quantity, select items with checkboxes, buy selected items
- Toast notifications instead of browser alerts
- Escaping of user input before rendering to prevent HTML injection

## Tech stack

- **Backend:** C#, ASP.NET Core (Minimal API), Entity Framework Core, SQLite
- **Frontend:** JavaScript (Fetch API, DOM), HTML, CSS
- **Tools:** Git, GitHub, Swagger, VS Code

## Project structure

```
backend/ThePastryShopApi   ASP.NET Core REST API (products and cart endpoints)
frontend                   welcome page, shop page, admin page
```

## How to run

1. Start the backend:
   ```
   cd backend/ThePastryShopApi
   dotnet run
   ```
   The API runs on `http://localhost:5160` (Swagger UI is available for testing the endpoints).
2. Open the `frontend` folder in VS Code and start `index.html` with the Live Server extension.

## Planned

- Product photos
- Pagination
- Admin authentication
- Final visual design
