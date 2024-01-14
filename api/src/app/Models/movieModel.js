const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  id: String,
  name: String,
  synopsis: String,
  rating: String,
  reserved: Boolean,
  reserveId: String,
  reservedExpiresAt: Date,
  leased: Boolean
});

movieSchema.statics.findOneAndRemove = async function (conditions) {
  return await this.findOneAndDelete(conditions);
};
const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
