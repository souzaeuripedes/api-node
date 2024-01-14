const { v4: uuidv4 } = require('uuid');
const Reserve = require('../Models/reserveModel');
const Movie = require('../Models/movieModel');

const bookMovie = async (req, res) => {
  try {
    const movieId = req.body.movieId;

    const movie = await Movie.findOne({
      id: movieId,
      $or: [
        { reserved: false },
        { reserved: { $exists: false } },
      ],
    });

    if (!movie) {
      return res.status(400).json({ error: 'Filme não disponível para reserva.' });
    }

    const reserveId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 3);

    const reserve = new Reserve({
      reserveId: reserveId,
      status: 'WAITING',
      expiresAt: expiresAt,
      movieId: movie.id?.toString() ?? '',
    });

    await Movie.updateOne({ id: movieId }, { reserved: true, reservedExpiresAt: expiresAt, reserveId: reserveId.toString() });
    await reserve.save();

    res.json({ reserveId, status: 'WAITING' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer reserva.' });
  }
};

const confirmReservation = async (req, res) => {
  try {
    const reserveId = req.body.reserveId;
    const existingReserve = await Reserve.findOne({ reserveId: reserveId });

    if (!existingReserve) {
      return res.status(400).json({ error: 'Reserva não encontrada ou não está ativa.' });
    }

    const scheduleId = uuidv4();
    existingReserve.status = 'LEASED';
    existingReserve.scheduleId = scheduleId;
    await existingReserve.save();

    await Movie.updateOne({ id: existingReserve.movieId }, { leased: true });

    res.json({ scheduleId, status: 'LEASED' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao confirmar a locação.' });
  }
};

const returnMovie = async (req, res) => {
  try {
    const scheduleId = req.body.scheduleId;
    const existingReserve = await Reserve.findOne({ scheduleId, status: 'LEASED' });

    if (!existingReserve) {
      return res.status(400).json({ error: 'Confirmação não encontrada ou não está ativa.' });
    }

    if (existingReserve.status === 'RETURNED') {
      return res.status(400).json({ error: 'Esta locação já foi devolvida anteriormente.' });
    }

    existingReserve.status = 'RETURNED';
    await existingReserve.save();

    await Movie.updateOne({ id: existingReserve.movieId }, { leased: false });

    res.json({ scheduleId, status: 'RETURNED' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao devolver o filme.' });
  }
};

const getReservationById = async (req, res) => {
  try {
    const reserveId = req.params.id;
    const reserve = await Reserve.findOne({ reserveId: reserveId });

    if (!reserve) {
      return res.status(404).json({ error: 'Reserva não encontrada.' });
    }

    res.json(reserve);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar reserva.' });
  }
};

module.exports = {
  bookMovie,
  confirmReservation,
  returnMovie,
  getReservationById,
};
