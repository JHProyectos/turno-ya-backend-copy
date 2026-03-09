import { Request, Response } from 'express';
import { ServicesController } from '../../services/services.controller.js';
import { ServicesRepository } from '../../services/services.repository.interface.js';
import { Services } from '../../services/services.entity.js';

// Mock del repositorio
const mockServicesRepository: jest.Mocked<ServicesRepository> = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  add: jest.fn(),
  update: jest.fn(),
  partialUpdate: jest.fn(),
  delete: jest.fn(),
};

// Mock de Request y Response de Express
const mockRequest = () => {
  return {
    params: {},
    body: {},
  } as Partial<Request>;
};

const mockResponse = () => {
  const res = {} as Partial<Response>;
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

describe('ServicesController', () => {
  let controller: ServicesController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    controller = new ServicesController(mockServicesRepository);
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  const sampleService: Services = new Services(
    1,
    'Corte de pelo',
    'Corte profesional',
    30,
    1500,
    'http://example.com/image.jpg',
    new Date('2024-01-01'),
    new Date('2024-01-01')
  );

  describe('findAllservices', () => {
    
    it('debe retornar todos los servicios', async () => {
      const services = [sampleService];
      mockServicesRepository.findAll.mockResolvedValue(services);

      await controller.findAllservices(req as Request, res as Response);

      expect(mockServicesRepository.findAll).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(services);
    });

    it('debe retornar array vacio si no hay servicios', async () => {
      mockServicesRepository.findAll.mockResolvedValue([]);

      await controller.findAllservices(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe('findServiceById', () => {
    
    it('debe retornar un servicio por ID', async () => {
      req.params = { id: '1' };
      mockServicesRepository.findOne.mockResolvedValue(sampleService);

      await controller.findServiceById(req as Request, res as Response);

      expect(mockServicesRepository.findOne).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(sampleService);
    });

    it('debe retornar 404 si el servicio no existe', async () => {
      req.params = { id: '999' };
      mockServicesRepository.findOne.mockResolvedValue(null);

      await controller.findServiceById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Service not found' });
    });
  });

  describe('addService', () => {
    
    it('debe crear un nuevo servicio', async () => {
      const newServiceData = {
        name: 'Nuevo Servicio',
        description: 'Descripcion',
        duration: 45,
        price: 2000,
        image_url: 'http://example.com/new.jpg',
      };
      req.body = newServiceData;
      mockServicesRepository.add.mockResolvedValue({ ...sampleService, ...newServiceData });

      await controller.addService(req as Request, res as Response);

      expect(mockServicesRepository.add).toHaveBeenCalledWith(newServiceData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('updateService', () => {
    
    it('debe actualizar un servicio existente', async () => {
      req.params = { id: '1' };
      req.body = { name: 'Servicio Actualizado', description: 'Nueva descripcion', duration: 60, price: 2500, image_url: 'http://example.com/updated.jpg' };
      const updatedService = { ...sampleService, ...req.body };
      mockServicesRepository.update.mockResolvedValue(updatedService);

      await controller.updateService(req as Request, res as Response);

      expect(mockServicesRepository.update).toHaveBeenCalledWith('1', req.body);
      expect(res.json).toHaveBeenCalledWith(updatedService);
    });

    it('debe retornar 404 si el servicio no existe', async () => {
      req.params = { id: '999' };
      req.body = { name: 'Test' };
      mockServicesRepository.update.mockResolvedValue(null);

      await controller.updateService(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Service not found' });
    });

    it('debe retornar 400 si el ID del body no coincide con la ruta', async () => {
      req.params = { id: '1' };
      req.body = { id: '2', name: 'Test' };

      await controller.updateService(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'El id del body no coincide con el id de la ruta' });
    });
  });

  describe('partialUpdateService', () => {
    
    it('debe actualizar parcialmente un servicio', async () => {
      req.params = { id: '1' };
      req.body = { price: 3000 };
      const updatedService = { ...sampleService, price: 3000 };
      mockServicesRepository.partialUpdate.mockResolvedValue(updatedService);

      await controller.partialUpdateService(req as Request, res as Response);

      expect(mockServicesRepository.partialUpdate).toHaveBeenCalledWith('1', { price: 3000 });
      expect(res.json).toHaveBeenCalledWith(updatedService);
    });

    it('debe retornar 404 si el servicio no existe', async () => {
      req.params = { id: '999' };
      req.body = { price: 3000 };
      mockServicesRepository.partialUpdate.mockResolvedValue(null);

      await controller.partialUpdateService(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Service not found' });
    });
  });

  describe('deleteService', () => {
    
    it('debe eliminar un servicio existente', async () => {
      req.params = { id: '1' };
      mockServicesRepository.delete.mockResolvedValue(sampleService);

      await controller.deleteService(req as Request, res as Response);

      expect(mockServicesRepository.delete).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(sampleService);
    });

    it('debe retornar 404 si el servicio no existe', async () => {
      req.params = { id: '999' };
      mockServicesRepository.delete.mockResolvedValue(null);

      await controller.deleteService(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Service not found' });
    });

    it('debe retornar 409 si el servicio tiene reservas asociadas', async () => {
      req.params = { id: '1' };
      const foreignKeyError = { code: '23503' };
      mockServicesRepository.delete.mockRejectedValue(foreignKeyError);

      await controller.deleteService(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'No se puede eliminar: el servicio tiene reservas asociadas.' });
    });

    it('debe retornar 500 en caso de error inesperado', async () => {
      req.params = { id: '1' };
      mockServicesRepository.delete.mockRejectedValue(new Error('Database error'));

      await controller.deleteService(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
});
