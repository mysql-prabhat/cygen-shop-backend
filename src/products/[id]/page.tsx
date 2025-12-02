"use client";

import { useEffect, useState } from "react";
{ api } from "@/utils/api";

export default function ProductDetail({ params }: any) {
  const { id } = params;
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    async function load() {
        api(`products/${id}`).then((data) => setProduct(data));
    }
    load();
  }, [id]);

  if (!product) return <p className="p-10 text-lg">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-lg mx-auto">
        <h1 className="text-3xl font-bold mb-3 text-gray-700">
          {product.title}
        </h1>

        <img
          src={product.thumbnail}
          className="w-full rounded-lg mb-4"
          alt={product.title}
        />

        <p className="text-2xl font-bold text-blue-600 mb-4">
          ₹{product.price}
        </p>

        <p className="text-gray-600 mb-4">{product.description}</p>

        <p className="text-sm text-gray-500">
          Brand: {product.brand}
        </p>

        <button className="mt-6 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
