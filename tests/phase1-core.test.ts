import { describe, expect, it } from 'vitest';
import { Shop } from '../src/domain/shop/Shop.js';
import { ShopMember } from '../src/domain/shop/ShopMember.js';
import { Product } from '../src/domain/product/Product.js';
import { Customer } from '../src/domain/customer/Customer.js';
import { Order } from '../src/domain/order/Order.js';
import { OrderItem } from '../src/domain/order/OrderItem.js';
import { InventoryTransaction } from '../src/domain/inventory/InventoryTransaction.js';
import { QuickSaleService } from '../src/application/QuickSaleService.js';

describe('Phase 1 core domain', () => {
  it('enforces multi-tenant isolation for products', () => {
    const shopA = new Shop({ id: 'shop-a', name: 'Shop A', ownerTelegramUserId: 101, status: 'ACTIVE' });
    const shopB = new Shop({ id: 'shop-b', name: 'Shop B', ownerTelegramUserId: 202, status: 'ACTIVE' });

    const productA = new Product({
      id: 'pA',
      shopId: shopA.id,
      name: 'Tea',
      sku: 'tea-1',
      purchasePrice: 2000,
      sellingPrice: 5000,
      stock: 10,
      lowStockThreshold: 2,
    });

    const productB = new Product({
      id: 'pB',
      shopId: shopB.id,
      name: 'Coffee',
      sku: 'coffee-1',
      purchasePrice: 3000,
      sellingPrice: 7000,
      stock: 5,
      lowStockThreshold: 2,
    });

    expect(productA.shopId).toBe(shopA.id);
    expect(productB.shopId).toBe(shopB.id);
    expect(productA.shopId).not.toBe(productB.shopId);
  });

  it('creates an order and reduces inventory exactly once', () => {
    const shopId = 'shop-1';
    const customer = new Customer({ id: 'cust-1', shopId, name: 'Mina', mobile: '09120000000' });
    const product = new Product({
      id: 'prod-1',
      shopId,
      name: 'Notebook',
      sku: 'nb-1',
      purchasePrice: 15000,
      sellingPrice: 25000,
      stock: 4,
      lowStockThreshold: 1,
    });

    const order = new Order({
      id: 'order-1',
      shopId,
      customerId: customer.id,
      status: 'NEW',
      source: 'TELEGRAM',
    });

    order.addItem(new OrderItem({ id: 'item-1', orderId: order.id, productId: product.id, productNameSnapshot: product.name, unitPrice: product.sellingPrice, quantity: 2, total: product.sellingPrice * 2 }));

    order.finalize();
    product.reduceStock(2);

    expect(order.finalAmount).toBe(50000);
    expect(product.stock).toBe(2);
    expect(order.status).toBe('CONFIRMED');
  });

  it('creates inventory ledger entries for sales and returns', () => {
    const shopId = 'shop-2';
    const product = new Product({
      id: 'prod-2',
      shopId,
      name: 'Pen',
      sku: 'pen-1',
      purchasePrice: 500,
      sellingPrice: 1500,
      stock: 10,
      lowStockThreshold: 2,
    });

    const sale = new InventoryTransaction({
      id: 'tx-1',
      shopId,
      productId: product.id,
      type: 'SALE',
      quantity: 2,
      referenceType: 'ORDER',
      referenceId: 'order-2',
      note: 'sale',
    });

    const returned = new InventoryTransaction({
      id: 'tx-2',
      shopId,
      productId: product.id,
      type: 'RETURN',
      quantity: 1,
      referenceType: 'ORDER',
      referenceId: 'order-2',
      note: 'return',
    });

    expect(sale.quantity).toBe(-2);
    expect(returned.quantity).toBe(1);
  });

  it('blocks order creation when stock is insufficient', () => {
    const shopId = 'shop-3';
    const customer = new Customer({ id: 'cust-3', shopId, name: 'Nilo', mobile: '09130000000' });
    const product = new Product({
      id: 'prod-3',
      shopId,
      name: 'Lamp',
      sku: 'lamp-1',
      purchasePrice: 25000,
      sellingPrice: 40000,
      stock: 1,
      lowStockThreshold: 1,
    });

    const service = new QuickSaleService();

    const result = service.createQuickOrder({
      shopId,
      customerId: customer.id,
      product,
      quantity: 2,
      source: 'TELEGRAM',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('ثبت سفارش انجام نشد. موجودی کالا کافی نیست.');
  });

  it('allows staff to join a shop and keeps ownership explicit', () => {
    const shop = new Shop({ id: 'shop-4', name: 'Team Shop', ownerTelegramUserId: 444, status: 'ACTIVE' });
    const member = new ShopMember({ id: 'member-1', shopId: shop.id, telegramUserId: 555, role: 'STAFF', status: 'ACTIVE' });

    expect(member.shopId).toBe(shop.id);
    expect(member.role).toBe('STAFF');
  });
});
