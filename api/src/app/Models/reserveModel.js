const mongoose = require('mongoose');

const reserveSchema = new mongoose.Schema({
  reserveId: String,
  movieId: String,
  status: String,
  expiresAt: Date,
  customerId: String,
  scheduleId: String,
});

const Reserve = mongoose.model('Reserve', reserveSchema);

module.exports = Reserve;
