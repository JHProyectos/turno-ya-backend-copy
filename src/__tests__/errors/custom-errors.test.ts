import { 
  AppError, 
  NotFoundError, 
  ValidationError, 
  ConflictError, 
  UnauthorizedError 
} from '../../errors/custom-errors.js';

describe('Custom Errors', () => {
  
  describe('AppError', () => {
    
    it('debe crear un error con todos los campos', () => {
      const error = new AppError('Test message', 'TEST_CODE', 400);
      
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('AppError');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it('debe tener stack trace', () => {
      const error = new AppError('Test', 'TEST', 500);
      
      expect(error.stack).toBeDefined();
    });
  });

  describe('NotFoundError', () => {
    
    it('debe crear error con recurso especificado', () => {
      const error = new NotFoundError('Cliente');
      
      expect(error.message).toBe('Cliente no encontrado');
      expect(error.code).toBe('CLIENTE_NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('debe crear error para diferentes recursos', () => {
      const errorServicio = new NotFoundError('Servicio');
      const errorTurno = new NotFoundError('Turno');
      
      expect(errorServicio.message).toBe('Servicio no encontrado');
      expect(errorServicio.code).toBe('SERVICIO_NOT_FOUND');
      
      expect(errorTurno.message).toBe('Turno no encontrado');
      expect(errorTurno.code).toBe('TURNO_NOT_FOUND');
    });

    it('debe ser instancia de AppError', () => {
      const error = new NotFoundError('Recurso');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);
    });
  });

  describe('ValidationError', () => {
    
    it('debe crear error de validacion', () => {
      const error = new ValidationError('El email es invalido');
      
      expect(error.message).toBe('El email es invalido');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    it('debe ser instancia de AppError', () => {
      const error = new ValidationError('Error');
      
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('ConflictError', () => {
    
    it('debe crear error de conflicto', () => {
      const error = new ConflictError('El email ya esta registrado');
      
      expect(error.message).toBe('El email ya esta registrado');
      expect(error.code).toBe('CONFLICT');
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('ConflictError');
    });

    it('debe ser instancia de AppError', () => {
      const error = new ConflictError('Conflicto');
      
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('UnauthorizedError', () => {
    
    it('debe crear error con mensaje por defecto', () => {
      const error = new UnauthorizedError();
      
      expect(error.message).toBe('No autorizado');
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('UnauthorizedError');
    });

    it('debe crear error con mensaje personalizado', () => {
      const error = new UnauthorizedError('Token expirado');
      
      expect(error.message).toBe('Token expirado');
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.statusCode).toBe(401);
    });

    it('debe ser instancia de AppError', () => {
      const error = new UnauthorizedError();
      
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('Error inheritance chain', () => {
    
    it('todos los errores deben ser instanceof Error', () => {
      const errors = [
        new AppError('test', 'TEST', 500),
        new NotFoundError('Test'),
        new ValidationError('test'),
        new ConflictError('test'),
        new UnauthorizedError(),
      ];
      
      errors.forEach(error => {
        expect(error).toBeInstanceOf(Error);
      });
    });

    it('los errores especificos deben ser instanceof AppError', () => {
      const errors = [
        new NotFoundError('Test'),
        new ValidationError('test'),
        new ConflictError('test'),
        new UnauthorizedError(),
      ];
      
      errors.forEach(error => {
        expect(error).toBeInstanceOf(AppError);
      });
    });
  });
});
