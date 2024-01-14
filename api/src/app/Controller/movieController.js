const { v4: uuidv4 } = require('uuid');
const Movie = require('../Models/movieModel');
const Reserve = require('../Models/reserveModel');

// Função para obter todos os filmes
const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ leased: false, reserved: false });

    const moviesWithoutReserve = await Movie.aggregate([
      {
        $lookup: {
          from: 'reserves', 
          localField: 'id',
          foreignField: 'movieId',
          as: 'reserves',
        },
      },
      {
        $match: {
          $or: [
            { reserves: { $size: 0 } }, 
            { 'reserves.status': 'RETURNED' }, 
          ],
        },
      },
    ]);
    res.json(moviesWithoutReserve);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar filmes.' });
  }
};

const getMovieById = async (req, res) => {
  try {
    console.log(req);
    const movieId = req.params.id;
    const movie = await Movie.findOne({ id: movieId, leased: false, reserved: false });

    if (!movie) {
      return res.status(404).json({ error: 'Filme não encontrado.' });
    }

    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar filme.' });
  }
};

const createMovie = async (req, res) => {
  try {
    // Consultar todos os filmes no banco de dados
    console.log(req.body);

    let idMovie = uuidv4();
    const newMovie = new Movie({
      id: idMovie,
      name: req.body.name,
      synopsis: req.body.synopsis,
      rating: req.body.rating,
    });

    await newMovie.save();

    res.json(newMovie);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar filme.' });
  }
};

const updateMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    const updatedMovie = {
      name: req.body.name,
      synopsis: req.body.synopsis,
      rating: req.body.rating,
    };

    const movie = await Movie.findOneAndUpdate({ id: movieId }, updatedMovie, { new: true });

    if (!movie) {
      return res.status(404).json({ error: 'Filme não encontrado.' });
    }

    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao editar filme.' });
  }
};

const deleteMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    const deletedMovie = await Movie.findOneAndRemove({ id: movieId });

    if (!deletedMovie) {
      return res.status(404).json({ error: 'Filme não encontrado.' });
    }

    res.json({ message: 'Filme excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir filme.' });
  }
};

const deleteAllMovies = async (req, res) => {
  try {
    const result = await Movie.deleteMany({});
    res.json({ message: `Removidos ${result.deletedCount} filmes.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Erro ao excluir filmes. Detalhes: ${error.message}` });
  }
};

const createBulkMovies = async (req, res) => {
  try {
    const moviesToCreate = Array.from({ length: 10 }, (_, index) => ({
      id: uuidv4(),
      name: `Filme ${index + 1}`,
      synopsis: `Sinopse do Filme ${index + 1}`,
      rating: '0', 
      reserved: false,
      reserveId: null,
      reservedExpiresAt: null,
      leased: false,
    }));
    const createdMovies = await Movie.insertMany(moviesToCreate);
    res.json({ message: 'Filmes cadastrados com sucesso.', createdMovies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar filmes.' });
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  deleteAllMovies,
  createBulkMovies,
};
