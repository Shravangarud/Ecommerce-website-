# E-Commerce Backend API

Complete Node.js backend with Express.js and MongoDB for your e-commerce website.

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                    # MongoDB connection configuration
├── controllers/
│   ├── authController.js        # Authentication logic (register, login, profile)
│   ├── cartController.js        # Shopping cart operations
│   ├── orderController.js       # Order management
│   └── productController.js     # Product CRUD operations
├── middleware/
│   ├── authMiddleware.js        # JWT authentication & admin check
│   └── errorMiddleware.js       # Error handling
├── models/
│   ├── Cart.js                  # Cart schema
│   ├── Order.js                 # Order schema
│   ├── Product.js               # Product schema
│   └── User.js                  # User schema with password hashing
├── routes/
│   ├── authRoutes.js            # Authentication endpoints
│   ├── cartRoutes.js            # Cart endpoints
│   ├── orderRoutes.js           # Order endpoints
│   └── productRoutes.js         # Product endpoints
├── utils/
│   └── generateToken.js         # JWT token generation utility
├── examples/
│   └── frontend-integration.js  # Frontend integration examples
├── .env                         # Environment variables
├── .gitignore                   # Git ignore file
├── package.json                 # Dependencies
└── server.js                    # Express server entry point
```

## 🚀 Getting Started

### Step 1: Install Dependencies

Open Command Prompt in the backend folder and run:

```bash
cd backend
npm install
```

This will install:
- express (web framework)
- mongoose (MongoDB ODM)
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- dotenv (environment variables)
- cors (cross-origin resource sharing)
- express-validator (input validation)

### Step 2: Configure Environment Variables

Edit the `.env` file with your MongoDB connection string:

```env
PORT=5000
NODE_ENV=development

# For local MongoDB:
MONGO_URI=mongodb://localhost:27017/ecommerce

# For MongoDB Atlas (cloud):
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority

JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=30d
```

### Step 3: Setup MongoDB

**Option A: Local MongoDB**
1. Download and install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use the connection string: `mongodb://localhost:27017/ecommerce`

**Option B: MongoDB Atlas (Cloud - Recommended for beginners)**
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Create a database user
4. Get your connection string
5. Replace username and password in the connection string
6. Update MONGO_URI in `.env` file

### Step 4: Start the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

You should see:
```
MongoDB Connected: cluster.mongodb.net
Server running in development mode on port 5000
```

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |

### Product Routes (`/api/products`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | Get all products | No |
| GET | `/api/products/:id` | Get single product | No |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |

### Cart Routes (`/api/cart`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cart` | Get user's cart | Yes |
| POST | `/api/cart` | Add item to cart | Yes |
| PUT | `/api/cart/:itemId` | Update cart item | Yes |
| DELETE | `/api/cart/:itemId` | Remove item from cart | Yes |
| DELETE | `/api/cart` | Clear cart | Yes |

### Order Routes (`/api/orders`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/orders` | Create new order | Yes |
| GET | `/api/orders/myorders` | Get user's orders | Yes |
| GET | `/api/orders/:id` | Get order by ID | Yes |
| GET | `/api/orders` | Get all orders | Admin |
| PUT | `/api/orders/:id/pay` | Mark order as paid | Yes |
| PUT | `/api/orders/:id/deliver` | Mark as delivered | Admin |
| PUT | `/api/orders/:id/cancel` | Cancel order | Yes |

## 🧪 Testing with Postman

### 1. Install Postman
Download from: https://www.postman.com/downloads/

### 2. Test Registration

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/register`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "_id": "65abc123...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Test Login

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/login`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Copy the `token` from the response!**

### 4. Test Protected Routes

For routes that require authentication, add this header:
- Key: `Authorization`
- Value: `Bearer YOUR_TOKEN_HERE`

Example - Get User Profile:
- Method: `GET`
- URL: `http://localhost:5000/api/auth/profile`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 5. Test Create Product (Admin only)

First, manually change user role to 'admin' in MongoDB:
```javascript
// In MongoDB Compass or Shell
db.users.updateOne(
  { email: "john@example.com" },
  { $set: { role: "admin" } }
)
```

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/products`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN`
- Body (raw JSON):
```json
{
  "name": "Gaming Laptop",
  "description": "High performance gaming laptop with RTX 4070",
  "price": 1299.99,
  "image": "https://example.com/laptop.jpg",
  "category": "electronics",
  "stock": 25
}
```

### 6. Test Get All Products

**Request:**
- Method: `GET`
- URL: `http://localhost:5000/api/products`
- Headers: `Content-Type: application/json`
- No authentication needed

### 7. Test Add to Cart

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/cart`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN`
- Body (raw JSON):
```json
{
  "productId": "PRODUCT_ID_FROM_MONGODB",
  "quantity": 2
}
```

### 8. Test Create Order

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/orders`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN`
- Body (raw JSON):
```json
{
  "orderItems": [
    {
      "name": "Gaming Laptop",
      "quantity": 1,
      "image": "laptop.jpg",
      "price": 1299.99,
      "product": "PRODUCT_ID_HERE"
    }
  ],
  "shippingAddress": {
    "address": "123 Main St",
    "city": "New York",
    "postalCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "Card",
  "taxPrice": 129.99,
  "shippingPrice": 10.00,
  "totalPrice": 1439.98
}
```

## 🔐 Authentication Flow

1. **Register/Login** → Receive JWT token
2. **Store token** in localStorage (frontend)
3. **Send token** in Authorization header for protected routes
4. **Format**: `Authorization: Bearer <token>`

## 💻 Frontend Integration

See `examples/frontend-integration.js` for complete examples of:
- Fetching products from API
- User registration/login
- Cart operations
- Order creation
- Error handling

### Quick Example:

```javascript
// Fetch products
const response = await fetch('http://localhost:5000/api/products');
const products = await response.json();

// Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password' })
});
const { token } = await loginResponse.json();

// Add to cart (with authentication)
await fetch('http://localhost:5000/api/cart', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ productId: '123', quantity: 1 })
});
```

## 🛡️ Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ Protected routes with middleware
- ✅ Admin-only routes
- ✅ Input validation
- ✅ Error handling
- ✅ CORS enabled

## 📝 Common Issues & Solutions

### Issue: MongoDB connection failed
**Solution:** 
- Check if MongoDB is running (local)
- Verify connection string in `.env`
- Check network access in MongoDB Atlas

### Issue: "Not authorized, no token"
**Solution:**
- Make sure you're sending the token in Authorization header
- Format: `Bearer <token>`
- Check if token is valid (not expired)

### Issue: "Not authorized as an admin"
**Solution:**
- Update user role to 'admin' in MongoDB database

### Issue: Port 5000 already in use
**Solution:**
- Change PORT in `.env` file
- Or kill the process using port 5000

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Configure MongoDB connection
3. ✅ Start the server
4. ✅ Test with Postman
5. ✅ Integrate with frontend
6. 🔄 Add more features (reviews, wishlist, etc.)

## 📚 Useful MongoDB Commands

```bash
# View all databases
show dbs

# Use ecommerce database
use ecommerce

# View all collections
show collections

# Find all users
db.users.find()

# Find all products
db.products.find()

# Update user to admin
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)

# Delete all products
db.products.deleteMany({})
```

## 🎨 VS Code Extensions (Recommended)

- REST Client (test API without Postman)
- MongoDB for VS Code
- ESLint
- Prettier

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify MongoDB connection
3. Check `.env` configuration
4. Ensure all dependencies are installed
5. Review the API endpoint format

---

**Happy Coding! 🚀**
