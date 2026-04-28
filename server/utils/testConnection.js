require('dotenv').config();
const mongoose = require('mongoose');

// Try direct connection bypassing SRV
const directURI = 'mongodb://mdhathri2006_db_user:Dhathri%231230@ac-mdmj9ik-shard-00-00.fjmskyu.mongodb.net:27017,ac-mdmj9ik-shard-00-01.fjmskyu.mongodb.net:27017,ac-mdmj9ik-shard-00-02.fjmskyu.mongodb.net:27017/food-delivery?ssl=true&replicaSet=atlas-13qlhb-shard-0&authSource=admin&retryWrites=true&w=majority';

console.log('Testing direct connection...');

mongoose.connect(directURI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
