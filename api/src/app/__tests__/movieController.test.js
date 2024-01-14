const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  deleteAllMovies,
  createBulkMovies,
} = require('../Controller/movieController'); // Atualize o caminho conforme necessário
const { v4: uuidv4 } = require('uuid');
const Movie = require('../Models/movieModel');
const Reserve = require('../Models/reserveModel');

jest.mock('../Models/movieModel');
jest.mock('../Models/reserveModel');

describe('Movie Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllMovies', () => {
    it('should get all movies without reserve', async () => {
      const mockMovies = [{ name: 'Movie 1' }, { name: 'Movie 2' }];
      Movie.find.mockResolvedValueOnce(mockMovies);
      Movie.aggregate.mockResolvedValueOnce(mockMovies);

      const req = {};
      const res = { json: jest.fn() };

      await getAllMovies(req, res);

      expect(res.json).toHaveBeenCalledWith(mockMovies);
    });


    it('should handle error when fetching movies', async () => {
      const req = {};
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      // Forçando um erro para simular o cenário de erro ao buscar filmes
      jest.spyOn(Movie, 'find').mockImplementationOnce(() => {
        throw new Error('Erro simulado ao buscar filmes');
      });

      await getAllMovies(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao buscar filmes.' });
    });
  });

  // Testes para getMovieById
  describe('getMovieById', () => {
    it('should get a movie by ID successfully', async () => {
      const movieId = 'exampleMovieId';
      const req = {
        params: { id: movieId },
      };
      const res = {
        json: jest.fn(),
      };

      jest.spyOn(Movie, 'findOne').mockResolvedValueOnce({
        id: movieId,
        name: 'Example Movie',
        synopsis: 'Synopsis of the movie.',
        rating: 5,
        leased: false,
        reserved: false,
      });

      await getMovieById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        id: movieId,
        name: 'Example Movie',
        synopsis: 'Synopsis of the movie.',
        rating: 5,
        leased: false,
        reserved: false,
      });
    });

    it('should handle movie not found', async () => {
      const movieId = 'nonexistentMovieId';
      const req = {
        params: { id: movieId },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      // Simula nenhum filme encontrado pelo ID
      jest.spyOn(Movie, 'findOne').mockResolvedValueOnce(null);

      await getMovieById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Filme não encontrado.' });
    });

    it('should handle error while fetching movie by ID', async () => {
      const movieId = 'exampleMovieId';
      const req = {
        params: { id: movieId },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      jest.spyOn(Movie, 'findOne').mockImplementationOnce(() => {
        throw new Error('Erro simulado ao buscar filme.');
      });

      await getMovieById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao buscar filme.' });
    });
  });


  //createMovie
  describe('getMovieById', () => {
    it('should create a new movie successfully', async () => {
      const req = {
        body: {
          name: 'Example Movie',
          synopsis: 'Synopsis of the movie.',
          rating: 5,
        },
      };

      const res = {
        json: jest.fn(),
      };

      const createdMovie = {
        id: 'someId',
        name: 'Example Movie',
        synopsis: 'Synopsis of the movie.',
        rating: 5,
      };

      jest.spyOn(Movie.prototype, 'save').mockImplementationOnce(async function () {
        Object.assign(this, createdMovie);
        return this;
      });

      await createMovie(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining(createdMovie));
    });

    it('should handle error during movie creation', async () => {
      const req = {
        body: {
          name: 'Example Movie',
          synopsis: 'Synopsis of the movie.',
          rating: 5,
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      jest.spyOn(Movie.prototype, 'save').mockImplementationOnce(() => {
        throw new Error('Erro simulado ao cadastrar filme.');
      });

      await createMovie(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao cadastrar filme.' });
    });
  });


  //updateMovie

  describe('updateMovie', () => {
    it('should update an existing movie successfully', async () => {
      const movieId = 'existingMovieId';
      const req = {
        params: {
          id: movieId,
        },
        body: {
          name: 'Updated Movie',
          synopsis: 'Updated synopsis.',
          rating: 4,
        },
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      jest.spyOn(Movie, 'findOneAndUpdate').mockImplementationOnce(async () => {
        return {
          id: movieId,
          name: 'Updated Movie',
          synopsis: 'Updated synopsis.',
          rating: 4,
        };
      });

      await updateMovie(req, res);
      expect(res.json).toHaveBeenCalledWith({
        id: movieId,
        name: 'Updated Movie',
        synopsis: 'Updated synopsis.',
        rating: 4,
      });
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle error when updating a movie', async () => {
      const req = { params: { id: 'movieId' }, body: {} };

      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };


      const expectedError = new Error('Erro ao editar filme.');
      jest.spyOn(Movie, 'findOneAndUpdate').mockImplementation(() => {
        throw expectedError;
      });

      await updateMovie(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('deleteMovie', () => {
      let req, res;

      beforeEach(() => {
        req = {
          params: {
            id: 'movieId',
          },
        };

        res = {
          json: jest.fn(),
          status: jest.fn(),
        };
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('should delete a movie successfully', async () => {
        jest.spyOn(Movie, 'findOneAndRemove').mockResolvedValue({ id: 'movieId' });
        await deleteMovie(req, res);
        expect(res.json).toHaveBeenCalledWith({ message: 'Filme excluído com sucesso.' });
        expect(res.status).not.toHaveBeenCalled();
      });

      it('should handle error when deleting a movie', async () => {
        const expectedError = new Error('Erro ao excluir filme.');
        jest.spyOn(Movie, 'findOneAndRemove').mockRejectedValue(expectedError);
        const req = { params: { id: 'movieId' } };
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        await deleteMovie(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should handle movie not found during deletion', async () => {
        jest.spyOn(Movie, 'findOneAndRemove').mockResolvedValue(null);
        const req = { params: { id: 'movieId' } };
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        await deleteMovie(req, res);
        expect(res.json).toHaveBeenCalledWith({ error: 'Filme não encontrado.' });
      });
    });
  });

  //delete all movies

  describe('deleteAllMovies', () => {
    it('should delete all movies successfully', async () => {
      jest.spyOn(Movie, 'deleteMany').mockResolvedValue({ deletedCount: 5 });
      const req = {};
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      await deleteAllMovies(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'Removidos 5 filmes.' });
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle error when deleting all movies', async () => {
      const expectedError = new Error('Erro ao excluir filmes.');
      jest.spyOn(Movie, 'deleteMany').mockRejectedValue(expectedError);
      const req = {};
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      await deleteAllMovies(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.status().json).toHaveBeenCalledWith({ error: 'Erro ao excluir filmes. Detalhes: Erro ao excluir filmes.' });
    });
  });


  // bulk insert 
  describe('createBulkMovies', () => {
    it('should create bulk movies successfully', async () => {
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

      jest.spyOn(Movie, 'insertMany').mockResolvedValue(moviesToCreate);
      const req = {};
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      await createBulkMovies(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'Filmes cadastrados com sucesso.', createdMovies: moviesToCreate });
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle error when creating bulk movies', async () => {
      const expectedError = new Error('Erro ao cadastrar filmes.');
      jest.spyOn(Movie, 'insertMany').mockRejectedValue(expectedError);
      const req = {};
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      await createBulkMovies(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.status().json).toHaveBeenCalledWith({ error: 'Erro ao cadastrar filmes.' });
    });
  });
});
