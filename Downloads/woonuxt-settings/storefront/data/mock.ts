export interface Product {
  id: string
  name: string
  slug: string
  price: string
  regularPrice?: string
  salePrice?: string
  description: string
  shortDescription: string
  image: string
  gallery: string[]
  category: string
  categorySlug: string
  inStock: boolean
  featured: boolean
}

export interface Category {
  name: string
  slug: string
  image: string
  count: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface StoreSettings {
  primary_color: string
  logo: string
  frontEndUrl: string
  domain: string
  maxPrice: number
  productsPerPage: number
  currencyCode: string
  currencySymbol: string
  global_attributes: {
    label: string
    slug: string
    showCount: boolean
    hideEmpty: boolean
    openByDefault: boolean
  }[]
  stripeSettings: {
    enabled: string
    testmode: string
    active_publishable_key: string
    account_id: string
  }
}

export const mockCategories: Category[] = [
  {
    name: 'Furniture',
    slug: 'furniture',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop',
    count: 4,
  },
  {
    name: 'Lighting',
    slug: 'lighting',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&h=600&fit=crop',
    count: 3,
  },
  {
    name: 'Decor',
    slug: 'decor',
    image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&h=600&fit=crop',
    count: 3,
  },
  {
    name: 'Textiles',
    slug: 'textiles',
    image: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=600&h=600&fit=crop',
    count: 2,
  },
]

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Nordic Lounge Chair',
    slug: 'nordic-lounge-chair',
    price: '649.00',
    regularPrice: '799.00',
    salePrice: '649.00',
    description: 'A beautifully crafted lounge chair with solid oak legs and premium wool upholstery. Designed for lasting comfort with a timeless Scandinavian aesthetic that complements any modern living space.',
    shortDescription: 'Scandinavian design lounge chair with solid oak frame.',
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&h=720&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&h=960&fit=crop',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=960&fit=crop',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=960&fit=crop',
    ],
    category: 'Furniture',
    categorySlug: 'furniture',
    inStock: true,
    featured: true,
  },
  {
    id: '2',
    name: 'Ceramic Table Lamp',
    slug: 'ceramic-table-lamp',
    price: '189.00',
    description: 'Handmade ceramic lamp with a linen shade. Each piece is unique with subtle variations in glaze. Warm, ambient lighting for bedside tables or reading nooks.',
    shortDescription: 'Handmade ceramic lamp with linen shade.',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&h=720&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=800&h=960&fit=crop',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&h=960&fit=crop',
    ],
    category: 'Lighting',
    categorySlug: 'lighting',
    inStock: true,
    featured: true,
  },
  {
    id: '3',
    name: 'Minimal Wall Clock',
    slug: 'minimal-wall-clock',
    price: '95.00',
    description: 'Clean-face wall clock with a brushed steel frame. Silent quartz movement. The perfect statement piece for minimalist interiors.',
    shortDescription: 'Silent quartz wall clock with brushed steel frame.',
    image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&h=720&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&h=960&fit=crop',
    ],
    category: 'Decor',
    categorySlug: 'decor',
    inStock: true,
    featured: false,
  },
  {
    id: '4',
    name: 'Oak Console Table',
    slug: 'oak-console-table',
    price: '420.00',
    description: 'Slim-profile console table crafted from solid white oak. Features a shelf for books or objects. Ideal for entryways and narrow spaces.',
    shortDescription: 'Solid white oak console table with lower shelf.',
    image: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=600&h=720&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=800&h=960&fit=crop',
    ],
    category: 'Furniture',
    categorySlug: 'furniture',
    inStock: true,
    featured: true,
  },
  {
    id: '5',
    name: 'Linen Throw Blanket',
    slug: 'linen-throw-blanket',
    price: '78.00',
    description: 'Stonewashed linen throw in a neutral oat tone. Soft, breathable, and perfect layered on a sofa or draped over a bed.',
    shortDescription: 'Stonewashed linen throw in neutral oat.',
    image: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=600&h=720&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=800&h=960&fit=crop',
    ],
    category: 'Textiles',
    categorySlug: 'textiles',
    inStock: true,
    featured: false,
  },
  {
    id: '6',
    name: 'Pendant Light — Arc',
    slug: 'pendant-light-arc',
    price: '245.00',
    description: 'Matte black pendant light with a soft arc silhouette. Adjustable drop height. Perfect over dining tables or kitchen islands.',
    shortDescription: 'Matte black pendant with adjustable height.',
    image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&h=720&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800&h=960&fit=crop',
    ],
    category: 'Lighting',
    categorySlug: 'lighting',
    inStock: true,
    featured: true,
  },
  {
    id: '7',
    name: 'Concrete Planter Set',
    slug: 'concrete-planter-set',
    price: '62.00',
    description: 'Set of 3 concrete planters in varying sizes. Minimal cylindrical design with drainage holes. For succulents, herbs, or small plants.',
    shortDescription: 'Set of 3 concrete planters for small plants.',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=720&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=960&fit=crop',
    ],
    category: 'Decor',
    categorySlug: 'decor',
    inStock: true,
    featured: false,
  },
  {
    id: '8',
    name: 'Walnut Desk Organizer',
    slug: 'walnut-desk-organizer',
    price: '54.00',
    description: 'Handcrafted walnut organizer with compartments for pens, cards, and small items. Oil-finished for a natural look and feel.',
    shortDescription: 'Handcrafted walnut organizer for your desk.',
    image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&h=720&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&h=960&fit=crop',
    ],
    category: 'Decor',
    categorySlug: 'decor',
    inStock: true,
    featured: false,
  },
  {
    id: '9',
    name: 'Wool Area Rug',
    slug: 'wool-area-rug',
    price: '320.00',
    regularPrice: '380.00',
    salePrice: '320.00',
    description: 'Hand-tufted wool rug in a cream and grey geometric pattern. 160×230 cm. Adds warmth and texture to any room.',
    shortDescription: 'Hand-tufted geometric wool rug, 160×230 cm.',
    image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&h=720&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&h=960&fit=crop',
    ],
    category: 'Textiles',
    categorySlug: 'textiles',
    inStock: true,
    featured: false,
  },
  {
    id: '10',
    name: 'Brass Floor Lamp',
    slug: 'brass-floor-lamp',
    price: '310.00',
    description: 'Slender brass floor lamp with a pivoting head. Brushed antique finish. Provides focused task lighting or ambient glow.',
    shortDescription: 'Brushed brass floor lamp with pivoting head.',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=720&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&h=960&fit=crop',
    ],
    category: 'Lighting',
    categorySlug: 'lighting',
    inStock: true,
    featured: false,
  },
  {
    id: '11',
    name: 'Bookshelf — Modular',
    slug: 'bookshelf-modular',
    price: '890.00',
    description: 'Modular bookshelf system in powder-coated steel and oak veneer. Configurable layout — stack or arrange side by side.',
    shortDescription: 'Modular steel and oak bookshelf system.',
    image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600&h=720&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&h=960&fit=crop',
    ],
    category: 'Furniture',
    categorySlug: 'furniture',
    inStock: true,
    featured: true,
  },
  {
    id: '12',
    name: 'Dining Bench — Ash',
    slug: 'dining-bench-ash',
    price: '375.00',
    description: 'Solid ash dining bench with rounded edges. Seats up to 3. Pairs beautifully with our dining tables for a cohesive look.',
    shortDescription: 'Solid ash bench seating up to 3 people.',
    image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&h=720&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=960&fit=crop',
    ],
    category: 'Furniture',
    categorySlug: 'furniture',
    inStock: true,
    featured: false,
  },
]

export const mockSettings: StoreSettings = {
  primary_color: '#111111',
  logo: '',
  frontEndUrl: 'http://localhost:3000',
  domain: 'localhost',
  maxPrice: 900,
  productsPerPage: 12,
  currencyCode: 'USD',
  currencySymbol: '$',
  global_attributes: [
    { label: 'Category', slug: 'category', showCount: true, hideEmpty: true, openByDefault: true },
  ],
  stripeSettings: {
    enabled: 'no',
    testmode: 'yes',
    active_publishable_key: '',
    account_id: '',
  },
}
