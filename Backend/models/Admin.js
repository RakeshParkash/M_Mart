const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    firstName: {
    type: String,
    required: true,
    },
    lastName: {
    type: String,
    },
    email: {
    type: String,
    unique: true, 
    sparse: true
    },
    phone: { type: String, unique: true },
    password: String,
    role: { type: String, default: 'admin' }
});

adminSchema.methods.comparePassword = function(pwd) {
  return bcrypt.compare(pwd, this.password);
};

adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model('Admin', adminSchema);
