// models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String }  // Store image as a base64 string if needed
});

const ItemModel = mongoose.model('Item', itemSchema);

module.exports = ItemModel;
