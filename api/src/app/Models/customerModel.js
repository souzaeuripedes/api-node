const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: String,
  name: String,
  email: String,
  phone: String
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
