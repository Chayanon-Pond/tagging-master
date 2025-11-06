import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private pool: Pool
    async onModuleInit() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        })
        try {
            const client = await this.pool.connect()
            console.log("Database connected successfully")
            client.release()
        }catch(error){
            console.log("Database connection fail",error)
            throw error
        }
    }
    async onModuleDestroy() {
        await this.pool.end()
    }
    async query(text: string, params?: any[]){
        const result = await this.pool.query(text, params)
        return result.rows
    }
    getPool(){
        return this.pool
    }
}