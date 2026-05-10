require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const vendors = await User.find({ role: 'vendor' }).select('_id');
  const vendorIds = vendors.map(v => v._id.toString());
  const result = await MenuItem.deleteMany({
    vendor: { $nin: vendorIds }
  });
  console.log(`Deleted ${result.deletedCount} orphaned menu items`);
  mongoose.disconnect();
});