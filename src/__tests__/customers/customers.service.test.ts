import { CustomersService } from '../../customers/customers.service.js';
import { CustomersPostgresRepository } from '../../customers/customers.postgres.repository.js';
import { Customer } from '../../customers/customers.entity.js';
import { NotFoundError } from '../../errors/custom-errors.js';
import bcrypt from 'bcrypt';

// Mock del repositorio
jest.mock('../../customers/customers.postgres.repository.js');
jest.mock('bcrypt');

describe('CustomersService', () => {
  let service: CustomersService;
  let mockRepository: jest.Mocked<CustomersPostgresRepository>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<CustomersPostgresRepository>;
    
    service = new CustomersService(mockRepository);
    jest.clearAllMocks();
  });

  const sampleCustomer: Customer = {
    id: 1,
    first_name: 'Juan',
    last_name: 'Perez',
    email: 'juan@email.com',
    password: 'hashedPassword123',
    phone: '+5491123456789',
    birth_date: '1990-05-15',
    role: 'customer',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  describe('getAllCustomers', () => {
    
    it('debe retornar todos los clientes', async () => {
      const customers = [sampleCustomer];
      mockRepository.findAll.mockResolvedValue(customers);

      const result = await service.getAllCustomers();

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(customers);
    });

    it('debe retornar array vacio si no hay clientes', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await service.getAllCustomers();

      expect(result).toEqual([]);
    });
  });

  describe('getCustomerById', () => {
    
    it('debe retornar un cliente por ID', async () => {
      mockRepository.findById.mockResolvedValue(sampleCustomer);

      const result = await service.getCustomerById(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(sampleCustomer);
    });

    it('debe lanzar NotFoundError si el cliente no existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getCustomerById(999)).rejects.toThrow(NotFoundError);
      await expect(service.getCustomerById(999)).rejects.toThrow('Cliente no encontrado');
    });
  });

  describe('createCustomer', () => {
    
    it('debe crear un nuevo cliente con password hasheado', async () => {
      const createInput = {
        first_name: 'Maria',
        last_name: 'Garcia',
        email: 'maria@email.com',
        password: 'Password123',
      };
      
      const hashedPassword = 'hashedPassword$2b$10$xyz';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      
      const createdCustomer = { ...sampleCustomer, ...createInput, password: hashedPassword };
      mockRepository.create.mockResolvedValue(createdCustomer);

      const result = await service.createCustomer(createInput);

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 10);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createInput,
        password: hashedPassword,
        role: 'customer',
      });
      expect(result).toEqual(createdCustomer);
    });

    it('debe asignar role customer por defecto', async () => {
      const createInput = {
        first_name: 'Carlos',
        last_name: 'Lopez',
        email: 'carlos@email.com',
        password: 'Secure123',
      };
      
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockRepository.create.mockResolvedValue({ ...sampleCustomer, ...createInput });

      await service.createCustomer(createInput);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'customer' })
      );
    });
  });

  describe('updateCustomer', () => {
    
    it('debe actualizar un cliente existente', async () => {
      const updateInput = { first_name: 'Juan Carlos' };
      mockRepository.findById.mockResolvedValue(sampleCustomer);
      
      const updatedCustomer = { ...sampleCustomer, first_name: 'Juan Carlos' };
      mockRepository.update.mockResolvedValue(updatedCustomer);

      const result = await service.updateCustomer(1, updateInput);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.update).toHaveBeenCalledWith(1, updateInput);
      expect(result).toEqual(updatedCustomer);
    });

    it('debe lanzar NotFoundError si el cliente no existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.updateCustomer(999, { first_name: 'Test' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteCustomer', () => {
    
    it('debe eliminar un cliente existente', async () => {
      mockRepository.findById.mockResolvedValue(sampleCustomer);
      mockRepository.delete.mockResolvedValue(undefined);

      await expect(service.deleteCustomer(1)).resolves.toBeUndefined();

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('debe lanzar NotFoundError si el cliente no existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.deleteCustomer(999)).rejects.toThrow(NotFoundError);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});
