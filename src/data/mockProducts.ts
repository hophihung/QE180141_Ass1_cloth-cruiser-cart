import { Product } from '@/types/product';
import tshirtImage from '@/assets/product-tshirt.jpg';
import jacketImage from '@/assets/product-jacket.jpg';
import dressImage from '@/assets/product-dress.jpg';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Cotton T-Shirt',
    description: 'Comfortable and stylish cotton t-shirt perfect for everyday wear. Made from 100% organic cotton with a modern slim fit.',
    price: 29.99,
    image: tshirtImage,
    category: 'T-Shirts',
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Navy', 'Gray']
  },
  {
    id: '2',
    name: 'Denim Jacket',
    description: 'Classic denim jacket with contemporary styling. Perfect for layering and made from premium denim fabric.',
    price: 89.99,
    image: jacketImage,
    category: 'Jackets',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Light Blue', 'Dark Blue']
  },
  {
    id: '3',
    name: 'Elegant Summer Dress',
    description: 'Flowing summer dress perfect for any occasion. Made from lightweight fabric with beautiful draping.',
    price: 79.99,
    image: dressImage,
    category: 'Dresses',
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Red', 'Blue', 'Green', 'Black']
  },
  {
    id: '4',
    name: 'Casual Hoodie',
    description: 'Comfortable hoodie for casual wear. Made from soft cotton blend with adjustable drawstring hood.',
    price: 59.99,
    category: 'Hoodies',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Gray', 'Black', 'Navy', 'Burgundy']
  },
  {
    id: '5',
    name: 'Slim Fit Chinos',
    description: 'Modern slim fit chinos suitable for both casual and smart-casual occasions.',
    price: 49.99,
    category: 'Pants',
    inStock: false,
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Khaki', 'Navy', 'Black', 'Olive']
  },
  {
    id: '6',
    name: 'Athletic Shorts',
    description: 'Lightweight athletic shorts perfect for workouts and active lifestyle.',
    price: 24.99,
    category: 'Shorts',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Gray', 'Red']
  }
];