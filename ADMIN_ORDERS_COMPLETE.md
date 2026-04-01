# Admin Orders Restructure - COMPLETE

## ✅ Completed Tasks

### 1. Database
- ✅ Created migration file: `backend/migrations/create-retail-orders-table.sql`
- ⚠️ **ACTION REQUIRED**: Run this SQL manually in your database

### 2. Backend API
- ✅ Created `backend/routes/retail-orders.js`
  - GET `/api/orders/retail` - Fetch all retail orders
  - POST `/api/orders/retail` - Create new order
  - PATCH `/api/orders/retail/:id` - Update order status
  - DELETE `/api/orders/retail/:id` - Delete order
- ✅ Auto-generates order IDs: RO-001, RO-002, etc.

### 3. Server Configuration
- ✅ Registered route in `backend/server.js`
- ✅ Added setup route for table creation

### 4. Admin Dashboard
- ✅ Removed OrderManagement component
- ✅ Kept PendingUsers (approve/deny wholesale accounts)
- ✅ Kept stats cards (Revenue, Orders, Products, Pending)

### 5. Admin Orders Page
- ✅ Updated to use correct API endpoints:
  - **Wholesale tab** → `/api/wholesale/orders`
  - **Retail tab** → `/api/orders/retail`
- ✅ Updated handleDelete to use correct endpoints
- ✅ Updated handleMarkShipped for retail orders
- ✅ Wholesale quote pricing unchanged

---

## 🔧 Manual Setup Required

### Create the retail_orders table

**Option 1: Using pgAdmin or any PostgreSQL client**
```sql
CREATE TABLE IF NOT EXISTS retail_orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(50),
    shipping_zip VARCHAR(20),
    items JSONB NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Processing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_retail_orders_order_id ON retail_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_retail_orders_status ON retail_orders(status);

CREATE OR REPLACE FUNCTION update_retail_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_retail_orders_updated_at ON retail_orders;

CREATE TRIGGER trigger_update_retail_orders_updated_at
BEFORE UPDATE ON retail_orders
FOR EACH ROW
EXECUTE FUNCTION update_retail_orders_updated_at();
```

**Option 2: Restart backend and call setup endpoint**
```bash
# Restart backend server
# Then visit in browser or use Postman:
POST http://localhost:5000/api/setup/setup-retail-orders
```

---

## 🧪 Testing

### 1. Test Retail Order Creation
```bash
curl -X POST http://localhost:5000/api/orders/retail \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "555-1234",
    "shipping_address": "123 Main St",
    "shipping_city": "New York",
    "shipping_state": "NY",
    "shipping_zip": "10001",
    "items": [{"product_id": 1, "quantity": 2, "name": "Test Coffee"}],
    "total": 50.00
  }'
```

### 2. Test Admin Orders Page
1. Go to `/admin/orders`
2. Click "RETAIL ORDERS" tab
3. Should see the test order (RO-001)
4. Click "SHIP" button
5. Verify status updates to "Shipped"

### 3. Test Wholesale Tab
1. Click "WHOLESALE QUOTES" tab
2. Should see existing wholesale quotes
3. "SET PRICE" button should still work

---

## 📝 What's NOT Changed

- ❌ Wholesale quote system (untouched)
- ❌ Cart logic (untouched)
- ❌ Dashboard stats (untouched)
- ❌ Checkout page (Stripe integration later)

---

## 🚀 Next Steps (When Ready for Stripe)

1. Update `retail-checkout/page.tsx` to call `POST /api/orders/retail` after payment
2. Add Stripe payment processing
3. Send confirmation emails to customers

---

## ✅ Verification Checklist

- [ ] retail_orders table created in database
- [ ] Backend server restarted
- [ ] Admin dashboard shows only PendingUsers + stats
- [ ] Admin orders page has 2 tabs
- [ ] Wholesale tab shows wholesale quotes
- [ ] Retail tab shows retail orders
- [ ] Can create test retail order via API
- [ ] Can mark retail order as shipped
- [ ] Wholesale quotes still work unchanged
