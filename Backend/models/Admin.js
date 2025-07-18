const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');
const adminSchema = new Schema({
phone: {
type: String,
required: true,
unique: true,
sparse: true,
trim: true,
match: [/^[0-9]{10,15}$/, 'Invalid phone']
},
password: { type: String, required: true, minlength: 8 },
role:     { type: String, default: 'admin' }
}, { timestamps: true });
adminSchema.pre('save', async function(next) {
if (!this.isModified('password')) return next();
this.password = await bcrypt.hash(this.password, 12);
next();
});
adminSchema.methods.comparePassword = function(candidate) {
return bcrypt.compare(candidate, this.password);
};
module.exports = model('Admin', adminSchema);