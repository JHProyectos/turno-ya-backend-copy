import { Services } from '../../services/services.entity.js';

describe('Services Entity', () => {
  
  it('debe crear una instancia con todos los campos', () => {
    const service = new Services(
      1,
      'Corte de pelo',
      'Corte profesional con tijera',
      30,
      1500,
      'http://example.com/corte.jpg',
      new Date('2024-01-01'),
      new Date('2024-01-15')
    );

    expect(service.id).toBe(1);
    expect(service.name).toBe('Corte de pelo');
    expect(service.description).toBe('Corte profesional con tijera');
    expect(service.duration).toBe(30);
    expect(service.price).toBe(1500);
    expect(service.image_url).toBe('http://example.com/corte.jpg');
    expect(service.created_at).toEqual(new Date('2024-01-01'));
    expect(service.updated_at).toEqual(new Date('2024-01-15'));
  });

  it('debe permitir modificar propiedades', () => {
    const service = new Services(
      1,
      'Servicio Original',
      'Descripcion original',
      30,
      1000,
      'http://example.com/original.jpg',
      new Date(),
      new Date()
    );

    service.name = 'Servicio Modificado';
    service.price = 2000;
    service.duration = 45;

    expect(service.name).toBe('Servicio Modificado');
    expect(service.price).toBe(2000);
    expect(service.duration).toBe(45);
  });

  it('debe aceptar diferentes tipos de valores', () => {
    const service = new Services(
      999,
      'Servicio Premium',
      '',  // descripcion vacia
      120, // 2 horas
      50000,
      '',  // sin imagen
      new Date('2020-01-01'),
      new Date('2025-12-31')
    );

    expect(service.id).toBe(999);
    expect(service.description).toBe('');
    expect(service.duration).toBe(120);
    expect(service.price).toBe(50000);
    expect(service.image_url).toBe('');
  });

  it('debe ser una instancia de Services', () => {
    const service = new Services(
      1, 'Test', 'Test', 30, 100, '', new Date(), new Date()
    );

    expect(service).toBeInstanceOf(Services);
  });
});
