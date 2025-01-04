# Services Layer

This directory contains service modules that handle data operations using Supabase as the backend.

## Structure

- `users.ts` - Handles user-related operations (CRUD)
- `products.ts` - Handles product-related operations (CRUD)
- `index.ts` - Exports all services

## Usage

Each service provides standard CRUD operations:

```typescript
// Example using the products service
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from './services/products';

// Get all products
const products = await getProducts();

// Get single product
const product = await getProductById('123');

// Create product
const newProduct = await createProduct({
  name: 'New Product',
  price: 99.99,
  category: 'Electronics'
});

// Update product
const updatedProduct = await updateProduct('123', {
  price: 89.99
});

// Delete product
await deleteProduct('123');
```

## Error Handling

All service functions will throw an error if the operation fails. Make sure to wrap calls in try/catch blocks:

```typescript
try {
  const products = await getProducts();
} catch (error) {
  console.error('Failed to fetch products:', error);
}
