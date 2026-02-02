const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const CustomerProfile = require('./models/CustomerProfile');
const ShopProfile = require('./models/ShopProfile');
const Design = require('./models/Design');
const Order = require('./models/Order');
const PricingRule = require('./models/PricingRule');

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// Seed data
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await CustomerProfile.deleteMany({});
    await ShopProfile.deleteMany({});
    await Design.deleteMany({});
    await Order.deleteMany({});
    await PricingRule.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // 1. Create Admin User
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'MukhawarAdmin2026!', 10);
    const admin = await User.create({
      email: process.env.ADMIN_EMAIL || 'admin@mukhawar.ae',
      password: adminPassword,
      name: 'Mukhawar Admin',
      phone: '+971501234567',
      role: 'Admin',
      isVerified: true
    });
    console.log('✅ Admin created:', admin.email, '\n');

    // 2. Create Shop Owners and Profiles
    console.log('🏪 Creating shop owners...');
    const shopPassword = await bcrypt.hash('Shop123!', 10);
    
    const shop1User = await User.create({
      email: 'alnoor@mukhawar.ae',
      password: shopPassword,
      name: 'Mohammed Al Noor',
      phone: '+971502345678',
      role: 'ShopOwner',
      isVerified: true
    });

    const shop1Profile = await ShopProfile.create({
      userId: shop1User._id,
      businessName: 'Al Noor Tailoring',
      ownerName: 'Mohammed Al Noor',
      businessLicense: 'SHJ-12345-2024',
      emirate: 'Sharjah',
      area: 'Industrial Area 13',
      address: 'Shop 45, Al Qasimia Street',
      coordinates: { lat: 25.3462, lng: 55.4209 },
      specializations: ['Thobes', 'Kandoras', 'Traditional Embroidery'],
      certificationTier: 'Premium',
      certificationStatus: 'Certified',
      yearsOfExperience: 8,
      maxActiveDesigns: 30,
      rating: 4.7,
      totalOrders: 156,
      completedOrders: 148,
      averageDeliveryDays: 5
    });

    const shop2User = await User.create({
      email: 'emirates@mukhawar.ae',
      password: shopPassword,
      name: 'Fatima Al Mansoori',
      phone: '+971503456789',
      role: 'ShopOwner',
      isVerified: true
    });

    const shop2Profile = await ShopProfile.create({
      userId: shop2User._id,
      businessName: 'Emirates Classic Tailoring',
      ownerName: 'Fatima Al Mansoori',
      businessLicense: 'DXB-67890-2024',
      emirate: 'Dubai',
      area: 'Deira',
      address: 'Shop 12, Gold Souk Complex',
      coordinates: { lat: 25.2697, lng: 55.3095 },
      specializations: ['Abayas', 'Jalabiyas', 'Formal Wear'],
      certificationTier: 'Specialist',
      certificationStatus: 'Certified',
      yearsOfExperience: 12,
      maxActiveDesigns: 50,
      rating: 4.9,
      totalOrders: 284,
      completedOrders: 276,
      averageDeliveryDays: 4
    });

    console.log('✅ Created 2 certified shops\n');

    // 3. Create Pending Shop for Certification Queue
    console.log('⏳ Creating pending shop...');
    const shop3User = await User.create({
      email: 'royal@mukhawar.ae',
      password: shopPassword,
      name: 'Ahmed Al Kindi',
      phone: '+971504567890',
      role: 'ShopOwner',
      isVerified: true
    });

    const shop3Profile = await ShopProfile.create({
      userId: shop3User._id,
      businessName: 'Royal Threads',
      ownerName: 'Ahmed Al Kindi',
      businessLicense: 'DXB-11111-2024',
      emirate: 'Dubai',
      area: 'Business Bay',
      address: 'Shop 78, Bay Square',
      coordinates: { lat: 25.1888, lng: 55.2580 },
      specializations: ['Modern Fashion', 'Business Suits'],
      certificationStatus: 'Pending',
      yearsOfExperience: 5
    });

    console.log('✅ Created 1 pending shop\n');

    // 4. Create Customer Users
    console.log('👥 Creating customers...');
    const customerPassword = await bcrypt.hash('Customer123!', 10);
    
    const customers = [];
    const customerData = [
      { name: 'Ahmed Mohammed', email: 'ahmed.m@email.ae', phone: '+971505678901' },
      { name: 'Fatima Khalid', email: 'fatima.k@email.ae', phone: '+971506789012' },
      { name: 'Sultan Abdullah', email: 'sultan.a@email.ae', phone: '+971507890123' },
      { name: 'Maryam Hassan', email: 'maryam.h@email.ae', phone: '+971508901234' },
      { name: 'Khalid Salem', email: 'khalid.s@email.ae', phone: '+971509012345' }
    ];

    for (const data of customerData) {
      const user = await User.create({
        ...data,
        password: customerPassword,
        role: 'Customer',
        isVerified: true
      });

      const profile = await CustomerProfile.create({
        userId: user._id,
        preferredLanguage: 'ar',
        savedAddresses: [{
          label: 'Home',
          emirate: 'Dubai',
          area: 'Dubai Marina',
          street: 'Marina Walk',
          building: 'Tower A',
          apartment: '1203',
          isDefault: true
        }]
      });

      customers.push({ user, profile });
    }

    console.log(`✅ Created ${customers.length} customers\n`);

    // 5. Create Designs
    console.log('🎨 Creating designs...');
    const designs = [];
    
    const designData = [
      {
        shopId: shop1Profile._id,
        name: 'Classic White Thobe',
        nameAr: 'ثوب أبيض كلاسيكي',
        category: 'Thobes',
        subcategory: 'Traditional',
        description: 'Premium Egyptian cotton white thobe with classic collar and cuffs',
        descriptionAr: 'ثوب أبيض من القطن المصري الفاخر مع ياقة وأساور كلاسيكية',
        basePrice: 250,
        customizationOptions: [
          { name: 'Collar Style', nameAr: 'نمط الياقة', type: 'select', options: ['Classic', 'Modern', 'Mandarin'], priceAdjustment: 0 },
          { name: 'Embroidery', nameAr: 'تطريز', type: 'select', options: ['None', 'Simple', 'Elaborate'], priceAdjustment: 50 }
        ],
        images: ['https://via.placeholder.com/800x800?text=White+Thobe'],
        isActive: true,
        views: 245,
        orders: 32
      },
      {
        shopId: shop1Profile._id,
        name: 'Luxury Black Thobe',
        nameAr: 'ثوب أسود فاخر',
        category: 'Thobes',
        subcategory: 'Formal',
        description: 'Elegant black thobe with gold embroidery details',
        descriptionAr: 'ثوب أسود أنيق مع تطريز ذهبي',
        basePrice: 350,
        images: ['https://via.placeholder.com/800x800?text=Black+Thobe'],
        isActive: true,
        views: 189,
        orders: 24
      },
      {
        shopId: shop2Profile._id,
        name: 'Modern Abaya with Lace',
        nameAr: 'عباية عصرية مع دانتيل',
        category: 'Abayas',
        subcategory: 'Modern',
        description: 'Contemporary black abaya with delicate lace trim',
        descriptionAr: 'عباية سوداء عصرية مع حواف دانتيل رقيقة',
        basePrice: 280,
        customizationOptions: [
          { name: 'Lace Color', nameAr: 'لون الدانتيل', type: 'select', options: ['Black', 'Gold', 'Silver'], priceAdjustment: 0 },
          { name: 'Sleeve Style', nameAr: 'نمط الأكمام', type: 'select', options: ['Regular', 'Bell', 'Butterfly'], priceAdjustment: 30 }
        ],
        images: ['https://via.placeholder.com/800x800?text=Modern+Abaya'],
        isActive: true,
        views: 412,
        orders: 56
      },
      {
        shopId: shop2Profile._id,
        name: 'Elegant Jalabiya',
        nameAr: 'جلابية أنيقة',
        category: 'Jalabiyas',
        subcategory: 'Traditional',
        description: 'Traditional jalabiya with intricate embroidery',
        descriptionAr: 'جلابية تقليدية مع تطريز معقد',
        basePrice: 320,
        images: ['https://via.placeholder.com/800x800?text=Jalabiya'],
        isActive: true,
        views: 156,
        orders: 18
      }
    ];

    for (const data of designData) {
      const design = await Design.create(data);
      designs.push(design);
    }

    console.log(`✅ Created ${designs.length} designs\n`);

    // 6. Create Pricing Rules
    console.log('💰 Creating pricing rules...');
    const zones = ['Z1', 'Z2', 'Z3', 'Z4'];
    const buckets = ['B1', 'B2', 'B3', 'B4'];
    const prices = {
      Z1: { B1: 15, B2: 25, B3: 40, B4: 60 },
      Z2: { B1: 20, B2: 35, B3: 55, B4: 80 },
      Z3: { B1: 25, B2: 45, B3: 70, B4: 100 },
      Z4: { B1: 30, B2: 50, B3: 80, B4: 120 }
    };

    for (const zone of zones) {
      for (const bucket of buckets) {
        await PricingRule.create({
          zone,
          bucket,
          customerPrice: prices[zone][bucket],
          platformMarginPercent: 15,
          isActive: true
        });
      }
    }

    console.log('✅ Created 16 pricing rules (4 zones × 4 buckets)\n');

    // 7. Create Sample Orders
    console.log('📦 Creating sample orders...');
    const orderStatuses = [
      'Payment Confirmed',
      'In Review',
      'In Production',
      'Ready for Pickup',
      'Out for Delivery',
      'Delivered'
    ];

    for (let i = 0; i < 5; i++) {
      const customer = customers[i];
      const design = designs[i % designs.length];
      const shop = i < 2 ? shop1Profile : shop2Profile;
      const status = orderStatuses[i % orderStatuses.length];

      await Order.create({
        orderNumber: `MKH-${1001 + i}`,
        customerId: customer.user._id,
        shopId: shop._id,
        designId: design._id,
        items: [{
          designId: design._id,
          quantity: 1,
          customizations: {},
          pricePerItem: design.basePrice
        }],
        measurements: {
          shoulder: 45,
          chest: 100,
          waist: 85,
          sleeve: 65,
          length: 150
        },
        deliveryAddress: customer.profile.savedAddresses[0],
        pricing: {
          subtotal: design.basePrice,
          deliveryFee: 25,
          total: design.basePrice + 25
        },
        status,
        paymentStatus: 'Paid',
        timeline: [
          {
            status: 'Payment Confirmed',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            note: 'Order placed and payment confirmed'
          }
        ]
      });
    }

    console.log('✅ Created 5 sample orders\n');

    // Summary
    console.log('=' .repeat(50));
    console.log('🎉 DATABASE SEED COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   • 1 Admin user`);
    console.log(`   • 3 Shop owners (2 certified, 1 pending)`);
    console.log(`   • 5 Customer accounts`);
    console.log(`   • 4 Designs`);
    console.log(`   • 16 Pricing rules`);
    console.log(`   • 5 Sample orders`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin:');
    console.log(`     Email: ${admin.email}`);
    console.log(`     Password: ${process.env.ADMIN_PASSWORD || 'MukhawarAdmin2026!'}`);
    console.log('   Shop Owner (Certified):');
    console.log(`     Email: alnoor@mukhawar.ae`);
    console.log(`     Password: Shop123!`);
    console.log('   Customer:');
    console.log(`     Email: ahmed.m@email.ae`);
    console.log(`     Password: Customer123!`);
    console.log('=' .repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
