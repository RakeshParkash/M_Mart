const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import Models
const User = require('./models/User');
const Product = require('./models/Product');
const History = require('./models/History');
const Receipt = require('./models/Receipt');
const CustomList = require('./models/CustomList');
const Contact = require('./models/Contact');

const backupAndWipeDatabase = async () => {
    try {
        const uri = `mongodb+srv://Main:${process.env.MONGO_PASSWORD}@cluster0.umnlmnl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
        console.log('Connecting to database...');
        await mongoose.connect(uri);
        console.log('Connected successfully!');

        // 1. PERFORM AUTOMATIC BACKUP BEFORE WIPING
        console.log('\n--- AUTOMATIC SAFETY BACKUP ---');
        console.log('Fetching all current data...');
        
        const backupData = {
            products: await Product.find({}),
            users: await User.find({}),
            histories: await History.find({}),
            receipts: await Receipt.find({}),
            customLists: await CustomList.find({}),
            contacts: await Contact.find({})
        };

        const backupDir = path.join(__dirname, 'backups');
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
        
        fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
        console.log(`✅ SAFETY BACKUP SAVED: ${backupFile}`);
        console.log('If you made a mistake, you can easily restore this file later!\n');

        // 2. WIPE THE DATABASE (Skipping Admin)
        console.log('--- WIPING DATA ---');
        console.log('Wiping Products...');
        await Product.deleteMany({});
        
        console.log('Wiping Users (Customers)...');
        await User.deleteMany({});

        console.log('Wiping Histories, Receipts, and CustomLists...');
        await History.deleteMany({});
        await Receipt.deleteMany({});
        await CustomList.deleteMany({});
        await Contact.deleteMany({});

        console.log('\n✅ Database wiped successfully! It is now a completely clean slate.');
        console.log('You can now log in with your Admin account and start fresh.');

    } catch (err) {
        console.error('Failed to wipe database:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database.');
    }
};

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('⚠️ WARNING: This will delete all Products and Users. A safety backup WILL be created first. Are you sure? (yes/no): ', (answer) => {
    if (answer.toLowerCase() === 'yes') {
        backupAndWipeDatabase().then(() => readline.close());
    } else {
        console.log('Operation cancelled.');
        readline.close();
    }
});
