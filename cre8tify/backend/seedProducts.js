const mongoose = require('mongoose');
const dotenv = require('dotenv');
const BaseProduct = require('./models/baseProductModel');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected for Seeding...'))
  .catch(err => console.log(err));

const baseProducts = [
  {
    name: "Women Fit Boxy T-shirt",
    material: "100% Ring-Spun Cotton",
    gsm: "240 GSM",
    fit: "Boxy / Street-style",
    description: "Premium Heavyweight fabric, bio-washed and pre-shrunk.",
    printSize: "4200 x 4800 px"
  },
  {
    name: "Men Standard Heavy Tee",
    material: "100% Organic Cotton",
    gsm: "210 GSM",
    fit: "Regular Fit",
    description: "Classic everyday heavyweight tee.",
    printSize: "4200 x 4800 px"
  }
];

const seedDB = async () => {
  await BaseProduct.deleteMany({}); // Clears old ones so you don't get duplicates
  await BaseProduct.insertMany(baseProducts);
  console.log("Base Products Seeded! 🎉");
  process.exit();
};

seedDB();