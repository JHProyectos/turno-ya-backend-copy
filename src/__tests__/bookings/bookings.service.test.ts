import { BookingsService } from '../../bookings/bookings.service.js';
import { BookingsPostgresRepository } from '../../bookings/bookings.postgres.repository.js';
import { Booking } from '../../bookings/bookings.entity.js';
import { NotFoundError, ConflictError } from '../../errors/custom-errors.js';

// Mock del repositorio
jest.mock('../../bookings/bookings.postgres.repository.js');

describe('BookingsService', () => {
  let service: BookingsService;
  let mockRepository: jest.Mocked<BookingsPostgresRepository>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      add: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<BookingsPostgresRepository>;
    
    service = new BookingsService(mockRepository);
    jest.clearAllMocks();
  });

  const sampleBooking: Booking = {
    id: 1,
    client_id: 1,
    client_name: 'Juan Perez',
    service_id: 1,
    service_name: 'Corte de pelo',
    booking_date: '2025-06-15',
    start_time: '10:00',
    end_time: '11:00',
    booking_status: 'pending',
    treatment_id: [],
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  describe('getAllBookings', () => {
    
    it('debe retornar todas las reservas', async () => {
      const bookings = [sampleBooking];
      mockRepository.findAll.mockResolvedValue(bookings);

      const result = await service.getAllBookings();

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(bookings);
    });

    it('debe retornar array vacio si no hay reservas', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await service.getAllBookings();

      expect(result).toEqual([]);
    });
  });

  describe('getBookingById', () => {
    
    it('debe retornar una reserva por ID', async () => {
      mockRepository.findById.mockResolvedValue(sampleBooking);

      const result = await service.getBookingById(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(sampleBooking);
    });

    it('debe lanzar NotFoundError si la reserva no existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getBookingById(999)).rejects.toThrow(NotFoundError);
      await expect(service.getBookingById(999)).rejects.toThrow('Turno no encontrado');
    });
  });

  describe('addBooking', () => {
    
    it('debe crear una nueva reserva', async () => {
      const createInput = {
        client_id: 2,
        client_name: 'Maria Garcia',
        service_id: 2,
        service_name: 'Manicura',
        booking_date: '2025-07-20',
        start_time: '14:00',
        end_time: '15:00',
        booking_status: 'pending' as const,
      };
      
      const createdBooking = { ...sampleBooking, ...createInput, id: 2 };
      mockRepository.add.mockResolvedValue(createdBooking);

      const result = await service.addBooking(createInput);

      expect(mockRepository.add).toHaveBeenCalledWith(createInput);
      expect(result).toEqual(createdBooking);
    });
  });

  describe('updateBooking', () => {
    
    it('debe actualizar una reserva existente', async () => {
      const updateInput = { booking_status: 'confirmed' as const };
      mockRepository.findById.mockResolvedValue(sampleBooking);
      
      const updatedBooking = { ...sampleBooking, booking_status: 'confirmed' as const };
      mockRepository.update.mockResolvedValue(updatedBooking);

      const result = await service.updateBooking(1, updateInput);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.update).toHaveBeenCalledWith(1, updateInput);
      expect(result).toEqual(updatedBooking);
    });

    it('debe lanzar NotFoundError si la reserva no existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.updateBooking(999, { booking_status: 'confirmed' })).rejects.toThrow(NotFoundError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('debe lanzar Error si la actualizacion falla', async () => {
      mockRepository.findById.mockResolvedValue(sampleBooking);
      mockRepository.update.mockResolvedValue(null);

      await expect(service.updateBooking(1, { booking_status: 'confirmed' })).rejects.toThrow('Error al actualizar el turno');
    });
  });

  describe('deleteBooking', () => {
    
    it('debe eliminar una reserva cancelada', async () => {
      const cancelledBooking = { ...sampleBooking, booking_status: 'cancelled' as const };
      mockRepository.findById.mockResolvedValue(cancelledBooking);
      mockRepository.delete.mockResolvedValue(undefined);

      await expect(service.deleteBooking(1)).resolves.toBeUndefined();

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('debe lanzar NotFoundError si la reserva no existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.deleteBooking(999)).rejects.toThrow(NotFoundError);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictError si la reserva no esta cancelada', async () => {
      mockRepository.findById.mockResolvedValue(sampleBooking); // status: 'pending'

      await expect(service.deleteBooking(1)).rejects.toThrow(ConflictError);
      await expect(service.deleteBooking(1)).rejects.toThrow('Solo se pueden eliminar turnos cancelados');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictError si la reserva esta confirmada', async () => {
      const confirmedBooking = { ...sampleBooking, booking_status: 'confirmed' as const };
      mockRepository.findById.mockResolvedValue(confirmedBooking);

      await expect(service.deleteBooking(1)).rejects.toThrow(ConflictError);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictError si la reserva esta completada', async () => {
      const completedBooking = { ...sampleBooking, booking_status: 'completed' as const };
      mockRepository.findById.mockResolvedValue(completedBooking);

      await expect(service.deleteBooking(1)).rejects.toThrow(ConflictError);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});
