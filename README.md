# Shopping Cart - Fullstack Integration Project

A fullstack shopping cart management application built with **Express.js** (REST API) and **React** (Vite).

## 🚀 Project Structure

```
.
├── client/          # React frontend (Vite)
│   ├── src/         # React components and styling
│   ├── .env         # Frontend environment variables (VITE_API_URL)
│   └── package.json
├── server/          # Express backend REST API
│   ├── routes/      # Express route handlers
│   ├── index.js     # Server entry point
│   ├── requests.http# REST client sample requests
│   └── package.json
├── my-understanding.md # Self-assessment & technical explanations
└── README.md
```

---

## 🛠️ Getting Started Locally

To run this project, you need to start both the **Backend Server** and the **Frontend Client** in separate terminals.

### 1. Start Backend Server (Express)

In your first terminal:

```bash
cd server
npm install
npm run dev
```

- Server will start on: **`http://localhost:3000`**
- Uses `node --watch index.js` for automatic server reloads during development.

### 2. Start Frontend Client (React + Vite)

In your second terminal:

```bash
cd client
npm install
npm run dev
```

- Client will start on: **`http://localhost:5173`**
- Connects to the Express API via `VITE_API_URL=http://localhost:3000` defined in `client/.env`.

---

## 📡 API Endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint | Description | Query / Body | Status Codes |
|---|---|---|---|---|
| `GET` | `/products` | Get list of all products | Optional query: `?search=keyword`, `?sortBy=price_asc\|price_desc` | `200` |
| `GET` | `/products/:id` | Get single product by ID | Route param: `:id` | `200`, `404` |
| `POST` | `/products` | Create a new product | Body: `{ "name": string, "price": number, "quantity"?: number }` | `201`, `400` |
| `PUT` | `/products/:id` | Update an existing product | Route param: `:id`, Body: `{ "name"?, "price"?, "quantity"? }` | `200`, `400`, `404` |
| `DELETE` | `/products/:id` | Delete a product by ID | Route param: `:id` | `200`, `404` |

---

## 🧪 Testing the API

You can test the backend API directly using the VS Code [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension with the provided `server/requests.http` file, or using curl / Postman.

---

## ✨ Features

- **Full CRUD Operations**: Create, Read, Update, and Delete products seamlessly.
- **Dynamic UI Updates**: React state updates directly without browser reload.
- **Search & Sort**: Filter products by name or sort by price via API query strings.
- **Error & Loading States**: Clear loading spinner, connection error alerts with Retry button, and form validation feedback.
- **Cart Summary**: Real-time calculation of total unique products, item quantities, and cart total value.
