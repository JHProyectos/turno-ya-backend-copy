import { createBookingSchema, updateBookingSchema, idParamSchema } from '../../bookings/bookings.schemas.js';

describe('Booking Schemas', () => {
  
  // Helper para obtener fecha futura
  const getFutureDate = (daysAhead: number = 7): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().split('T')[0];
  };

  // Helper para obtener fecha pasada
  const getPastDate = (daysAgo: number = 7): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  };

  describe('createBookingSchema', () => {
    
    describe('Validaciones exitosas', () => {
      
      it('debe aceptar datos validos completos', () => {
        const validData = {
          client_id: 1,
          client_name: 'Juan Perez',
          service_id: 1,
          service_name: 'Corte de pelo',
          booking_date: getFutureDate(),
          start_time: '10:00',
          end_time: '11:00',
          booking_status: 'pending'
        };
        
        const result = createBookingSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('debe aceptar hora con segundos', () => {
        const validData = {
          client_id: 1,
          client_name: 'Juan Perez',
          service_id: 1,
          service_name: 'Corte de pelo',
          booking_date: getFutureDate(),
          start_time: '10:00:00',
          end_time: '11:00:00'
        };
        
        const result = createBookingSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('debe asignar status pending por defecto', () => {
        const validData = {
          client_id: 1,
          client_name: 'Juan Perez',
          service_id: 1,
          service_name: 'Corte de pelo',
          booking_date: getFutureDate(),
          start_time: '10:00',
          end_time: '11:00'
        };
        
        const result = createBookingSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.booking_status).toBe('pending');
        }
      });

      it('debe aceptar treatment_id opcional', () => {
        const validData = {
          client_id: 1,
          client_name: 'Juan Perez',
          service_id: 1,
          service_name: 'Corte de pelo',
          booking_date: getFutureDate(),
          start_time: '10:00',
          end_time: '11:00',
          treatment_id: ['treatment-1', 'treatment-2']
        };
        
        const result = createBookingSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('debe coercionar IDs de string a number', () => {
        const validData = {
          client_id: '1',
          client_name: 'Juan Perez',
          service_id: '2',
          service_name: 'Corte de pelo',
          booking_date: getFutureDate(),
          start_time: '10:00',
          end_time: '11:00'
        };
        
        const result = createBookingSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.client_id).toBe(1);
          expect(result.data.service_id).toBe(2);
        }
      });
    });

    describe('Validaciones de client_id y service_id', () => {
      
      it('debe rechazar client_id negativo', () => {
        const invalidData = {
          client_id: -1,
          client_name: 'Juan Perez',
          service_id: 1,
          service_name: 'Corte de pelo',
          booking_date: getFutureDate(),
          start_time: '10:00',
          end_time: '11:00'
        };
        
        const result = createBookingSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('debe rechazar service_id cero', () => {
        const invalidData = {
          client_id: 1,
          client_name: 'Juan Perez',
          service_id: 0,
          service_name: 'Corte de pelo',
          booking_date: getFutureDate(),
          start_time: '10:00',
          end_time: '11:00'
        };
        
        const result = createBookingSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('Validaciones de nombres', () => {
      
      it('debe rechazar client_name vacio', () => {
        const invalidData = {
          client_id: 1,
          client_name: '',
          service_id: 1,
          service_name: 'Corte de pelo',
          booking_date: getFutureDate(),
          start_time: '10:00',
          end_time: '11:00'
        };
        
        const result = createBookingSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('debe rechazar service_name vacio', () => {
        const invalidData = {
          client_id: 1,
          client_name: 'Juan Perez',
          service_id: 1,
          service_name: '',
          booking_date: getFutureDate(),
          start_time: '10:00',
          end_time: '11:00'
        };
        
        const result = createBookingSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('Validaciones de booking_date', () => {
      
      it('debe rechazar fecha pasada', () => {
        const invalidData = {
          client_id: 1,
          client_name: 'Juan Perez',
          service_id: 1,
          service_name: 'Corte de pelo',
          booking_date: getPastDate(),
          start_time: '10:00',
          end_time: '11:00'
        };
        
        const result = createBookingSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('debe rechazar formato de fecha invalido', () => {
        const invalidData = {
          client_id: 1,
          client_name: 'Juan Perez',
          service_id: 1,
          service_name: 'Corte de pelo',
          booking_date: '25-12-2025',
          start_time: '10:00',
          end_time: '11:00'
        };
        
        const result = createBookingSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('debe rechazar fecha con formato incompleto', () => {
        const invalidData = {
          client_id: 1,
          client_name: 'Juan Perez',
          service_id: 1,
          service_name: 'Corte de pelo',
          booking_date: '2025-12',
          start_time: '10:00',
          end_time: '11:00'
        };
        
        const result = createBookingSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('Validaciones de horarios', () => {
      
      it('debe rechazar hora de inicio con formato invalido', () => {
        const invalidData = {
          client_id: 1,
          client_name: 'Juan Perez',
          service_id: 1,
          service_name: 'Corte de pelo',
          booking_date: getFutureDate(),
          start_time: '10am',
          end_time: '11:00'
        };
        
        const result = createBookingSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('debe rechazar hora de fin con formato invalido', () => {
        const invalidData = {
          client_id: 1,
          client_name: 'Juan Perez',
          service_id: 1,
          service_name: 'Corte de pelo',
          booking_date: getFutureDate(),
          start_time: '10:00',
          end_time: '11pm'
        };
        
        const result = createBookingSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('debe rechazar cuando hora fin es anterior a hora inicio', () => {
        const invalidData = {
          client_id: 1,
          client_name: 'Juan Perez',
          service_id: 1,
          service_name: 'Corte de pelo',
          booking_date: getFutureDate(),
          start_time: '15:00',
          end_time: '14:00'
        };
        
        const result = createBookingSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('debe rechazar cuando hora fin es igual a hora inicio', () => {
        const invalidData = {
          client_id: 1,
          client_name: 'Juan Perez',
          service_id: 1,
          service_name: 'Corte de pelo',
          booking_date: getFutureDate(),
          start_time: '10:00',
          end_time: '10:00'
        };
        
        const result = createBookingSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('Validaciones de booking_status', () => {
      
      it('debe aceptar status confirmed', () => {
        const validData = {
          client_id: 1,
          client_name: 'Juan Perez',
          service_id: 1,
          service_name: 'Corte de pelo',
          booking_date: getFutureDate(),
          start_time: '10:00',
          end_time: '11:00',
          booking_status: 'confirmed'
        };
        
        const result = createBookingSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('debe aceptar status cancelled', () => {
        const validData = {
          client_id: 1,
          client_name: 'Juan Perez',
          service_id: 1,
          service_name: 'Corte de pelo',
          booking_date: getFutureDate(),
          start_time: '10:00',
          end_time: '11:00',
          booking_status: 'cancelled'
        };
        
        const result = createBookingSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('debe aceptar status completed', () => {
        const validData = {
          client_id: 1,
          client_name: 'Juan Perez',
          service_id: 1,
          service_name: 'Corte de pelo',
          booking_date: getFutureDate(),
          start_time: '10:00',
          end_time: '11:00',
          booking_status: 'completed'
        };
        
        const result = createBookingSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('debe rechazar status invalido', () => {
        const invalidData = {
          client_id: 1,
          client_name: 'Juan Perez',
          service_id: 1,
          service_name: 'Corte de pelo',
          booking_date: getFutureDate(),
          start_time: '10:00',
          end_time: '11:00',
          booking_status: 'invalid_status'
        };
        
        const result = createBookingSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('updateBookingSchema', () => {
    
    it('debe aceptar actualizacion parcial de status', () => {
      const validData = {
        booking_status: 'confirmed'
      };
      
      const result = updateBookingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('debe aceptar actualizacion de fecha', () => {
      const validData = {
        booking_date: getFutureDate(14)
      };
      
      const result = updateBookingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('debe aceptar actualizacion de horario', () => {
      const validData = {
        start_time: '14:00',
        end_time: '15:00'
      };
      
      const result = updateBookingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('debe rechazar objeto vacio', () => {
      const invalidData = {};
      
      const result = updateBookingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('debe rechazar fecha pasada en actualizacion', () => {
      const invalidData = {
        booking_date: getPastDate()
      };
      
      const result = updateBookingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('debe rechazar status invalido en actualizacion', () => {
      const invalidData = {
        booking_status: 'invalid'
      };
      
      const result = updateBookingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('idParamSchema', () => {
    
    it('debe aceptar y transformar ID valido', () => {
      const result = idParamSchema.safeParse({ id: '42' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(42);
      }
    });

    it('debe rechazar ID no numerico', () => {
      const result = idParamSchema.safeParse({ id: 'abc' });
      expect(result.success).toBe(false);
    });

    it('debe rechazar ID negativo', () => {
      const result = idParamSchema.safeParse({ id: '-1' });
      expect(result.success).toBe(false);
    });
  });
});
