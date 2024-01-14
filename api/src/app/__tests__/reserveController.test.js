const { v4: uuidv4 } = require('uuid');
const Reserve = require('../Models/reserveModel');
const Movie = require('../Models/movieModel');
const Customer = require('../Models/customerModel');
const { bookMovie,
  confirmReservation,
  returnMovie,
  getReservationById } = require('../Controller/reserveController');

describe('Reserve Controller', () => {
  describe('bookMovie', () => {
    it('should book a movie successfully', async () => {
      const availableMovie = {
        id: 'movieId',
        reserved: false,
      };

      jest.spyOn(Movie, 'findOne').mockResolvedValue(availableMovie);
      jest.spyOn(Movie, 'updateOne').mockResolvedValue({});
      jest.spyOn(Reserve.prototype, 'save').mockResolvedValue({});

      const req = { body: { movieId: 'movieId' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      await bookMovie(req, res);

      expect(res.json).toHaveBeenCalledWith({ reserveId: expect.any(String), status: 'WAITING' });

    });

    it('should handle unavailable movie for reservation', async () => {
      const unavailableMovie = {
        id: 'movieId',
        reserved: true,
      };

      jest.spyOn(Movie, 'findOne').mockResolvedValue(null);
      const req = { body: { movieId: 'movieId' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      await bookMovie(req, res);
      expect(res.status).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ error: 'Filme não disponível para reserva.' });
    });



    it('should handle error when booking a movie', async () => {
      const expectedError = new Error('Erro ao fazer reserva.');
      jest.spyOn(Movie, 'findOne').mockResolvedValue({});
      jest.spyOn(Movie, 'updateOne').mockRejectedValue(expectedError);
      const req = { body: { movieId: 'movieId' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      await bookMovie(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.status().json).toHaveBeenCalledWith({ error: 'Erro ao fazer reserva.' });
    });


    //confirmReservation

    describe('bookMovie', () => {
      

      it('should confirm return 500', async () => {
        const existingReserve = {
          reserveId: 'reserveId',
          status: 'WAITING',
          movieId: 'movieId',
        };
        jest.spyOn(Reserve, 'findOne').mockResolvedValue(existingReserve);

        jest.spyOn(Reserve.prototype, 'save').mockResolvedValue({});
        jest.spyOn(Movie, 'updateOne').mockResolvedValue({});
        const req = { body: { reserveId: 'reserveId' } };
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        await confirmReservation(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
      });


      it('should handle reservation not found or not active', async () => {
        jest.spyOn(Reserve, 'findOne').mockResolvedValue(null);
        const req = { body: { reserveId: 'reserveId' } };
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        await confirmReservation(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Reserva não encontrada ou não está ativa.' });
      });
    });

  });



  describe('returnMovie', () => {
  
    it('should handle confirmation not found or not active', async () => {
      jest.spyOn(Reserve, 'findOne').mockResolvedValue(null);
      const req = { body: { scheduleId: 'scheduleId' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      await returnMovie(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Confirmação não encontrada ou não está ativa.' });
    });

    it('should handle movie already returned', async () => {
      const existingReserve = {
        scheduleId: 'scheduleId',
        status: 'RETURNED',
        movieId: 'movieId',
      };

      jest.spyOn(Reserve, 'findOne').mockResolvedValue(existingReserve);
      const req = { body: { scheduleId: 'scheduleId' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      await returnMovie(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Esta locação já foi devolvida anteriormente.' });
    });
  });

  describe('getReservationById', () => {
    it('should get a reservation by ID successfully', async () => {
      const existingReserve = {
        reserveId: 'reserveId',
      };

      jest.spyOn(Reserve, 'findOne').mockResolvedValue(existingReserve);
      const req = { params: { id: 'reserveId' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      await getReservationById(req, res);
      expect(res.json).toHaveBeenCalledWith(existingReserve);
    });

    it('should handle reservation not found', async () => {
      jest.spyOn(Reserve, 'findOne').mockResolvedValue(null);
      const req = { params: { id: 'nonexistentId' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      await getReservationById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Reserva não encontrada.' });
    });

    it('should handle internal server error', async () => {
      jest.spyOn(Reserve, 'findOne').mockRejectedValue(new Error('Internal Server Error'));
      const req = { params: { id: 'reserveId' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      await getReservationById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao buscar reserva.' });
    });
  });

});
