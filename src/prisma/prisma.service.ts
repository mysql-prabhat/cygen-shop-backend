// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {

  async onModuleInit() {
    await this.$connect();
    this.$use(async (params, next) => {
      console.log('SQL:', params.model, params.action, params.args);
      return next(params);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}