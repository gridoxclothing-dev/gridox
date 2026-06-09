# Gridox Clothing

A premium, full-stack e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js). Gridox provides a robust, visually appealing storefront for customers and a comprehensive owner portal for store management.

## 🌟 Features

### Client Website (`/clientwebsite`)
* **Modern UI:** Built with React and styled for an ultra-premium, dark-mode aesthetic with smooth animations.
* **Product Catalog:** Interactive product discovery with filtering and detailed product pages.
* **Shopping Cart & Checkout:** Seamless purchase flow.
* **Dynamic Coupons:** Support for per-item discounts, usage limits, and expiration dates.
* **Order Tracking:** Customers can view and track their order status.
* **Fully Responsive:** Optimized for both mobile and desktop experiences.

### Owner Portal (`/ownersite`)
* **Dashboard:** Centralized management interface for the business owner.
* **Order Management:** Track active orders, update statuses, and manage order lifecycles (Completed/Cancelled).
* **Inventory Control:** Add, edit, and categorize products.
* **Coupon System:** Generate and manage dynamic discount codes securely.

### Backend (`/backend`)
* **RESTful API:** Robust Express.js server providing secure data access.
* **Database:** MongoDB for scalable data storage (Users, Products, Orders, Coupons).
* **Authentication:** Secure user and owner authentication flows.

## 🚀 Tech Stack

* **Frontend:** React, TypeScript, Vite, CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose
* **Tooling:** Concurrently for seamless multi-environment development

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/gridoxclothing-dev/gridox.git
   cd gridox
   ```

2. **Install all dependencies**
   Run the root installation script which installs dependencies for the root, backend, client, and owner portals automatically:
   ```bash
   npm run install:all
   ```

3. **Environment Variables**
   Ensure you have configured your `.env` files appropriately in the respective folders (e.g., `backend/.env`, `clientwebsite/.env`, `ownersite/.env`). You will need your database connection strings and secret keys.

4. **Run the Development Servers**
   To run both the backend server and the client website concurrently:
   ```bash
   npm run dev
   ```

5. **Build for Production**
   To build all parts of the application (Client, Owner Site, and Backend) for deployment:
   ```bash
   npm run build
   ```

## 📂 Project Structure

```text
gridox/
├── backend/            # Express server, MongoDB models, API routes
├── clientwebsite/      # React storefront for customers
├── ownersite/          # React admin dashboard for store management
└── package.json        # Root workspace scripts (install, build, dev)
```
