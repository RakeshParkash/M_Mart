const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const bcrypt = require('bcrypt');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mmart', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Connected to DB');

  // 1. Create a few realistic products
  const productsToCreate = [
    {
      name: 'Basmati Rice',
      category: 'Grocery',
      description: 'Premium quality rice',
      quantity_Unit: '1 kg',
      baseUnit: 'kg',
      stock: { type: 'packet', value: 50, unit: 'kg' },
      selling_Price: { price: 120, unit: 'kg' },
      buying_Price: { price: 90, unit: 'kg' }
    },
    {
      name: 'Refined Sugar',
      category: 'Grocery',
      description: 'Pure white sugar',
      quantity_Unit: '500 g',
      baseUnit: 'g',
      stock: { type: 'packet', value: 100, unit: 'g' },
      selling_Price: { price: 40, unit: 'g' },
      buying_Price: { price: 30, unit: 'g' }
    },
    {
      name: 'Coca Cola',
      category: 'Beverages',
      description: 'Cold drink',
      quantity_Unit: '1 Litre',
      baseUnit: 'litre',
      stock: { type: 'bottle', value: 40, unit: 'litre' },
      selling_Price: { price: 65, unit: 'litre' },
      buying_Price: { price: 50, unit: 'litre' }
    }
  ];

  for (const p of productsToCreate) {
    const exists = await Product.findOne({ name: p.name });
    if (!exists) {
      await Product.create(p);
      console.log(`Created product: ${p.name}`);
    }
  }

  // 2. Create a test user
  let user = await User.findOne({ phone: '9999999999' });
  if (!user) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    user = await User.create({
      firstName: 'Rahul',
      lastName: 'Sharma (Test Customer)',
      email: 'rahul.test@example.com',
      phone: '9999999999',
      password: hashedPassword
    });
    console.log('Created test user Rahul Sharma');
  }

  // 3. Add some sample history
  user.dues = [
    {
      date: '2023-10-01',
      items: [
        { name: 'Basmati Rice', quantity: 2, dueAmount: 240, fullyPaid: false },
        { name: 'Refined Sugar', quantity: 1, dueAmount: 40, fullyPaid: false }
      ]
    },
    {
      date: '2023-10-15',
      items: [
        { name: 'Coca Cola', quantity: 3, dueAmount: 195, fullyPaid: false }
      ]
    }
  ];

  user.purchased_history = [
    {
      date: '2023-09-20',
      items: [
        { name: 'Basmati Rice', quantity: 1, advancePaid: 120, totalPrice: 120, status: 'Delivered' }
      ]
    }
  ];

  await user.save();
  console.log('Added sample dues and purchases for test user');

  mongoose.disconnect();
}).catch(console.error);
