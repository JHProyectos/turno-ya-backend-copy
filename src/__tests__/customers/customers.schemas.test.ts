import { createCustomerSchema, updateCustomerSchema, idParamSchema } from '../../customers/customers.schemas.js';

describe('Customer Schemas', () => {
  
  describe('createCustomerSchema', () => {
    
    describe('Validaciones exitosas', () => {
      
      it('debe aceptar datos validos completos', () => {
        const validData = {
          first_name: 'Juan',
          last_name: 'Perez',
          email: 'juan@email.com',
          password: 'Password123',
          phone: '+5491123456789',
          birth_date: '1990-05-15'
        };
        
        const result = createCustomerSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('debe aceptar datos sin campos opcionales', () => {
        const validData = {
          first_name: 'Maria',
          last_name: 'Garcia',
          email: 'maria@email.com',
          password: 'Secure123'
        };
        
        const result = createCustomerSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('debe transformar el email a minusculas', () => {
        const validData = {
          first_name: 'Juan',
          last_name: 'Perez',
          email: 'JUAN@EMAIL.COM',
          password: 'Password123'
        };
        
        const result = createCustomerSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.email).toBe('juan@email.com');
        }
      });

      it('debe hacer trim a los nombres', () => {
        const validData = {
          first_name: '  Juan  ',
          last_name: '  Perez  ',
          email: 'juan@email.com',
          password: 'Password123'
        };
        
        const result = createCustomerSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.first_name).toBe('Juan');
          expect(result.data.last_name).toBe('Perez');
        }
      });
    });

    describe('Validaciones de first_name', () => {
      
      it('debe rechazar nombre muy corto', () => {
        const invalidData = {
          first_name: 'J',
          last_name: 'Perez',
          email: 'juan@email.com',
          password: 'Password123'
        };
        
        const result = createCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('debe rechazar nombre muy largo', () => {
        const invalidData = {
          first_name: 'A'.repeat(51),
          last_name: 'Perez',
          email: 'juan@email.com',
          password: 'Password123'
        };
        
        const result = createCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('debe rechazar nombre con numeros', () => {
        const invalidData = {
          first_name: 'Juan123',
          last_name: 'Perez',
          email: 'juan@email.com',
          password: 'Password123'
        };
        
        const result = createCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('debe rechazar nombre con caracteres especiales', () => {
        const invalidData = {
          first_name: 'Juan@#$',
          last_name: 'Perez',
          email: 'juan@email.com',
          password: 'Password123'
        };
        
        const result = createCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('debe rechazar nombre con 3+ letras iguales consecutivas', () => {
        const invalidData = {
          first_name: 'Juaaan',
          last_name: 'Perez',
          email: 'juan@email.com',
          password: 'Password123'
        };
        
        const result = createCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('debe aceptar nombres con acentos', () => {
        const validData = {
          first_name: 'María José',
          last_name: 'González',
          email: 'maria@email.com',
          password: 'Password123'
        };
        
        const result = createCustomerSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    describe('Validaciones de email', () => {
      
      it('debe rechazar email sin @', () => {
        const invalidData = {
          first_name: 'Juan',
          last_name: 'Perez',
          email: 'juanemail.com',
          password: 'Password123'
        };
        
        const result = createCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('debe rechazar email sin dominio', () => {
        const invalidData = {
          first_name: 'Juan',
          last_name: 'Perez',
          email: 'juan@',
          password: 'Password123'
        };
        
        const result = createCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('Validaciones de password', () => {
      
      it('debe rechazar password muy corta', () => {
        const invalidData = {
          first_name: 'Juan',
          last_name: 'Perez',
          email: 'juan@email.com',
          password: 'Pass1'
        };
        
        const result = createCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('debe rechazar password sin mayuscula', () => {
        const invalidData = {
          first_name: 'Juan',
          last_name: 'Perez',
          email: 'juan@email.com',
          password: 'password123'
        };
        
        const result = createCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('debe rechazar password sin minuscula', () => {
        const invalidData = {
          first_name: 'Juan',
          last_name: 'Perez',
          email: 'juan@email.com',
          password: 'PASSWORD123'
        };
        
        const result = createCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('debe rechazar password sin numero', () => {
        const invalidData = {
          first_name: 'Juan',
          last_name: 'Perez',
          email: 'juan@email.com',
          password: 'PasswordABC'
        };
        
        const result = createCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('Validaciones de phone', () => {
      
      it('debe aceptar telefono con formato valido', () => {
        const validData = {
          first_name: 'Juan',
          last_name: 'Perez',
          email: 'juan@email.com',
          password: 'Password123',
          phone: '+5491123456789'
        };
        
        const result = createCustomerSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('debe rechazar telefono muy corto', () => {
        const invalidData = {
          first_name: 'Juan',
          last_name: 'Perez',
          email: 'juan@email.com',
          password: 'Password123',
          phone: '12345'
        };
        
        const result = createCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('debe rechazar telefono con letras', () => {
        const invalidData = {
          first_name: 'Juan',
          last_name: 'Perez',
          email: 'juan@email.com',
          password: 'Password123',
          phone: '+54abc123456'
        };
        
        const result = createCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('Validaciones de birth_date', () => {
      
      it('debe aceptar fecha valida', () => {
        const validData = {
          first_name: 'Juan',
          last_name: 'Perez',
          email: 'juan@email.com',
          password: 'Password123',
          birth_date: '1990-05-15'
        };
        
        const result = createCustomerSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('debe rechazar fecha futura', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const futureDateStr = futureDate.toISOString().split('T')[0];
        
        const invalidData = {
          first_name: 'Juan',
          last_name: 'Perez',
          email: 'juan@email.com',
          password: 'Password123',
          birth_date: futureDateStr
        };
        
        const result = createCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('debe rechazar fecha anterior a 1900', () => {
        const invalidData = {
          first_name: 'Juan',
          last_name: 'Perez',
          email: 'juan@email.com',
          password: 'Password123',
          birth_date: '1899-12-31'
        };
        
        const result = createCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('debe rechazar formato de fecha invalido', () => {
        const invalidData = {
          first_name: 'Juan',
          last_name: 'Perez',
          email: 'juan@email.com',
          password: 'Password123',
          birth_date: '15-05-1990'
        };
        
        const result = createCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('updateCustomerSchema', () => {
    
    it('debe aceptar actualizacion parcial', () => {
      const validData = {
        first_name: 'Carlos'
      };
      
      const result = updateCustomerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('debe rechazar objeto vacio', () => {
      const invalidData = {};
      
      const result = updateCustomerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('debe validar campos proporcionados', () => {
      const invalidData = {
        first_name: 'J' // muy corto
      };
      
      const result = updateCustomerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('idParamSchema', () => {
    
    it('debe aceptar ID numerico como string', () => {
      const validData = { id: '123' };
      
      const result = idParamSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(123);
        expect(typeof result.data.id).toBe('number');
      }
    });

    it('debe rechazar ID no numerico', () => {
      const invalidData = { id: 'abc' };
      
      const result = idParamSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('debe rechazar ID negativo', () => {
      const invalidData = { id: '-5' };
      
      const result = idParamSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('debe rechazar ID decimal', () => {
      const invalidData = { id: '12.5' };
      
      const result = idParamSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
