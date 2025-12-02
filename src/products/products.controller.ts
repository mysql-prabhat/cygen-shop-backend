import { Controller, Get, Param } from '@nestjs/common';
import fetch from 'node-fetch';

@Controller('api/products')
export class ProductsController {

  @Get()
  async getProducts() {
    const res = await fetch(
      'https://dummyjson.com/products?limit=10&skip=10&select=title,price'
    );
    const data:any = await res.json();
    return data.products;
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    const res = await fetch(`https://dummyjson.com/products/${id}`);
    const data:any = await res.json();
    return data;
  }
}
