import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor() {
    console.log('REDIS_HOST =>',process.env.REDIS_URL);
    
    this.client = new Redis(process.env.REDIS_URL || "");
    //console.log('client =>',this.client);
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async set(key: string, value: any, ttlSeconds = 30) {
    return this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(pattern: string) {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      return this.client.del(...keys);
    }
    return 0;
  }
}
