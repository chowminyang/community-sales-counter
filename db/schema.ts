import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const sales = sqliteTable('sales', {
  id: text('id').primaryKey(),
  createdAt: integer('created_at').notNull(),
  method: text('method').notNull(),
  total: integer('total').notNull(),
  lines: text('lines').notNull(),
  voided: integer('voided').notNull().default(0),
});
export const attempts = sqliteTable('login_attempts', {
  id: text('id').primaryKey(),
  count: integer('count').notNull(),
  resetAt: integer('reset_at').notNull(),
});
