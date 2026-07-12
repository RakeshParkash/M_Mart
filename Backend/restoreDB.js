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

const restoreDatabase = async (fileName) => {
    try {
        const backupFile = path.join(__dirname, 'backups', fileName);
        if (!fs.existsSync(backupFile)) {
            console.error(`❌ Backup file not found: ${backupFile}`);
            return;
        }

        console.log(`Reading backup file: ${fileName}...`);
        const data = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));

        const uri = `mongodb+srv://Main:${process.env.MONGO_PASSWORD}@cluster0.umnlmnl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
        console.log('Connecting to database...');
        await mongoose.connect(uri);
        console.log('Connected successfully!');

        console.log('\n--- RESTORING DATA ---');
        
        if (data.products && data.products.length > 0) {
            console.log(`Restoring ${data.products.length} Products...`);
            await Product.insertMany(data.products);
        }
        
        if (data.users && data.users.length > 0) {
            console.log(`Restoring ${data.users.length} Users...`);
            await User.insertMany(data.users);
        }

        if (data.histories && data.histories.length > 0) {
            console.log(`Restoring ${data.histories.length} Histories...`);
            await History.insertMany(data.histories);
        }

        if (data.receipts && data.receipts.length > 0) {
            console.log(`Restoring ${data.receipts.length} Receipts...`);
            await Receipt.insertMany(data.receipts);
        }

        if (data.customLists && data.customLists.length > 0) {
            console.log(`Restoring ${data.customLists.length} Custom Lists...`);
            await CustomList.insertMany(data.customLists);
        }

        if (data.contacts && data.contacts.length > 0) {
            console.log(`Restoring ${data.contacts.length} Contacts...`);
            await Contact.insertMany(data.contacts);
        }

        console.log('\n✅ Database RESTORED successfully! Your data is back.');

    } catch (err) {
        console.error('Failed to restore database:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database.');
    }
};

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const backupsDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupsDir)) {
    console.log('No backups directory found.');
    process.exit(0);
}

const files = fs.readdirSync(backupsDir).filter(f => f.endsWith('.json'));
if (files.length === 0) {
    console.log('No backup files found in the backups directory.');
    process.exit(0);
}

console.log('Available backups:');
files.forEach((f, i) => console.log(`[${i}] ${f}`));

readline.question('\nEnter the number of the backup you want to restore (or type "cancel"): ', (answer) => {
    if (answer.toLowerCase() === 'cancel') {
        console.log('Operation cancelled.');
        readline.close();
        return;
    }

    const index = parseInt(answer);
    if (isNaN(index) || index < 0 || index >= files.length) {
        console.log('Invalid selection. Cancelled.');
        readline.close();
    } else {
        const selectedFile = files[index];
        console.log(`\n⚠️ WARNING: This will insert all records from ${selectedFile}.`);
        console.log('Make sure your database is empty first, or you may get duplicate key errors.');
        
        readline.question('Are you sure you want to restore this? (yes/no): ', (confirm) => {
            if (confirm.toLowerCase() === 'yes') {
                restoreDatabase(selectedFile).then(() => readline.close());
            } else {
                console.log('Operation cancelled.');
                readline.close();
            }
        });
    }
});
