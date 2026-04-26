import { connectDB } from './mongoose';
import Product from './models/Product';

const sampleProducts = [
  {
    name: 'TG Premium Hoodie',
    description: 'Ultra-soft minimalist hoodie featuring the TG Fun Hub logo in subtle grayscale. Perfect for late-night coding sessions or casual meetups.',
    price: 249900, // 2499.00 INR
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800',
    category: 'Apparel',
    stock: 50,
  },
  {
    name: 'Stealth Tech Backpack',
    description: 'Water-resistant, anti-theft backpack designed for the modern digital nomad. Fits up to a 16-inch laptop with dedicated pockets for all your gear.',
    price: 499900, // 4999.00 INR
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
    category: 'Accessories',
    stock: 25,
  },
  {
    name: 'Minimal Mechanical Keyboard',
    description: 'Hot-swappable mechanical keyboard with custom linear switches and white LED backlighting. Aluminum chassis with a clean, industrial look.',
    price: 899900, // 8999.00 INR
    imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800',
    category: 'Tech',
    stock: 15,
  },
  {
    name: 'TG Hub Founders Mug',
    description: 'Limited edition matte black ceramic mug with the TG insignia. Keeps your coffee hot and your setup looking sharp.',
    price: 79900, // 799.00 INR
    imageUrl: 'https://images.unsplash.com/photo-1517256011107-5fa21438b03c?auto=format&fit=crop&q=80&w=800',
    category: 'Lifestyle',
    stock: 100,
  }
];

export async function seedProducts() {
  try {
    await connectDB();
    
    // Check if products already exist
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log('Products already seeded.');
      return;
    }
    
    await Product.insertMany(sampleProducts);
    console.log('Sample products seeded successfully.');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}
