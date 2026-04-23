import ProductImage from '@/components/ProductImage';
import axios from 'axios';
import { API_URL as API_BASE } from '@/lib/apiConfig';

async function getProduct(id: string) {
  const res = await axios.get(`${API_BASE}/products/${id}`);
  return res.data;
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  return (
    <div className="container mx-auto p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative h-[400px] w-full">
          {/* Here our new component is being used */}
          <ProductImage 
            src={product.images?.[0]} 
            alt={product.name} 
            fill 
            className="object-contain rounded-xl shadow-lg"
          />
        </div>
        
        <div>
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <p className="text-2xl text-green-600 mt-4">${product.price}</p>
          <p className="text-gray-600 mt-6">{product.description}</p>
          <button className="mt-8 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}