
// This file contains the PostgreSQL implementation for the ProductService.
// It is only imported and used on the server-side when a POSTGRES_URL is available.
import { Pool, PoolClient } from 'pg';
import type { Product } from '@/lib/types';

let pool: Pool | null = null;

// Lazy initialization of the pool
function getPool(): Pool {
    if (!process.env.POSTGRES_URL) {
        throw new Error("PostgresProductService: POSTGRES_URL is not set. Service will not function.");
    }
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.POSTGRES_URL,
        });
    }
    return pool;
}


function formatProduct(row: any): Product {
    if (!row) return row;
    return {
        id: row.id,
        name: row.name,
        sku: row.sku,
        buyingPrice: parseFloat(row.buyingPrice) || 0,
        profitMargin: parseFloat(row.profitMargin) || 0,
        sellingPrice: parseFloat(row.sellingPrice) || 0,
        stock: parseInt(row.stock, 10) || 0,
        initialStock: parseInt(row.initialStock, 10) || 0,
        containerSize: parseInt(row.containerSize, 10) || 0,
        mainCategory: row.mainCategory,
        category: row.category,
        subCategory: row.subCategory,
    };
}


class PostgresProductService {
    static async checkConnection(): Promise<void> {
        const db = getPool();
        await db.query('SELECT 1');
    }

    static async getAllProducts(): Promise<Product[]> {
        const db = getPool();
        const { rows } = await db.query('SELECT * FROM products ORDER BY name ASC');
        return rows.map(formatProduct);
    }

    static async getProductById(productId: string): Promise<Product | undefined> {
        const db = getPool();
        const { rows } = await db.query('SELECT * FROM products WHERE id = $1', [productId]);
        return formatProduct(rows[0]);
    }

    static async addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
        const db = getPool();
        const newId = `prod-${Date.now()}`;
        const newProduct: Product = { 
            ...productData, 
            id: newId, 
            initialStock: productData.stock,
            containerSize: productData.stock,
        };

        await db.query(
            'INSERT INTO products (id, name, sku, "buyingPrice", "profitMargin", "sellingPrice", stock, "initialStock", "containerSize", "mainCategory", category, "subCategory") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
            [newProduct.id, newProduct.name, newProduct.sku, newProduct.buyingPrice, newProduct.profitMargin, newProduct.sellingPrice, newProduct.stock, newProduct.initialStock, newProduct.containerSize, newProduct.mainCategory, newProduct.category, newProduct.subCategory]
        );
        return newProduct;
    }
    
    static async addMultipleProducts(productsData: Omit<Product, 'id'>[]): Promise<Product[]> {
        const db = getPool();
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const newProducts = await Promise.all(productsData.map(async p => {
                const newId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                 const newProduct: Product = { 
                    ...p, 
                    id: newId,
                    initialStock: p.stock,
                    containerSize: p.stock
                };
                await client.query(
                    'INSERT INTO products (id, name, sku, "buyingPrice", "profitMargin", "sellingPrice", stock, "initialStock", "containerSize", "mainCategory", category, "subCategory") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
                    [newProduct.id, newProduct.name, newProduct.sku, newProduct.buyingPrice, newProduct.profitMargin, newProduct.sellingPrice, newProduct.stock, newProduct.initialStock, newProduct.containerSize, newProduct.mainCategory, newProduct.category, newProduct.subCategory]
                );
                return newProduct;
            }));
            await client.query('COMMIT');
            return newProducts;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async updateProduct(productId: string, updatedData: Partial<Omit<Product, 'id'>>, isAdditive: boolean): Promise<Product | null> {
        const db = getPool();
        
        if (isAdditive) {
            const stockToAdd = updatedData.stock || 0;
            const result = await db.query(
                'UPDATE products SET stock = stock + $1, "initialStock" = stock + $1, "containerSize" = stock + $1 WHERE id = $2 RETURNING *',
                [stockToAdd, productId]
            );
            return formatProduct(result.rows[0]);
        } else {
            const { name, sku, buyingPrice, profitMargin, sellingPrice, stock, containerSize, initialStock, mainCategory, category, subCategory } = updatedData;
            const result = await db.query(
                `UPDATE products SET 
                    name = COALESCE($1, name), 
                    sku = COALESCE($2, sku), 
                    "buyingPrice" = COALESCE($3, "buyingPrice"), 
                    "profitMargin" = COALESCE($4, "profitMargin"), 
                    "sellingPrice" = COALESCE($5, "sellingPrice"), 
                    stock = COALESCE($6, stock), 
                    "containerSize" = COALESCE($7, "containerSize"),
                    "initialStock" = COALESCE($8, "initialStock"),
                    "mainCategory" = COALESCE($9, "mainCategory"),
                    category = COALESCE($10, category),
                    "subCategory" = COALESCE($11, "subCategory")
                 WHERE id = $12 RETURNING *`,
                [name, sku, buyingPrice, profitMargin, sellingPrice, stock, containerSize, initialStock, mainCategory, category, subCategory, productId]
            );
            return formatProduct(result.rows[0]);
        }
    }
    
    static async updateMultipleStocks(updates: { id: string; stockChange: number }[], client?: PoolClient): Promise<void> {
        const db = getPool();
        const queryRunner = client || await db.connect();

        try {
            for (const update of updates) {
                await queryRunner.query(
                    'UPDATE products SET stock = stock + $1 WHERE id = $2',
                    [update.stockChange, update.id]
                );
            }
        } finally {
            if (!client) {
                (queryRunner as PoolClient).release();
            }
        }
    }


    static async deleteProduct(productId: string): Promise<string | null> {
        const db = getPool();
        const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING name', [productId]);
        return result.rows[0]?.name || null;
    }
}

export default PostgresProductService;
