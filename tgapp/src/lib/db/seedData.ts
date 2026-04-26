import { connectDB } from './mongoose';
import Product from './models/Product';
import Post from './models/Post';

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
];

const samplePosts = [
  {
    type: 'video',
    content: 'Check out the new platform tour!',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1634567890/sample_video.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
    title: 'Platform Architecture Deep Dive',
    author: '650f1a2b3c4d5e6f7a8b9c0d', // Mock ID
    isVerified: true,
  },
  {
    type: 'reel',
    content: 'Late night coding vibes 💻',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1634567890/sample_reel.mp4',
    author: '650f1a2b3c4d5e6f7a8b9c0d', // Mock ID
    isVerified: true,
  }
];

export async function seedAll() {
  try {
    await connectDB();
    
    // Seed Products
    if (await Product.countDocuments() === 0) {
      await Product.insertMany(sampleProducts);
      console.log('Sample products seeded.');
    }
    
    // Seed Posts (if empty)
    if (await Post.countDocuments() === 0) {
      await Post.insertMany(samplePosts);
      console.log('Sample posts (Videos/Reels) seeded.');
    }
    
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}
