# Turno Ya - Backend API

## Introduccion

**Turno Ya** es una API REST desarrollada con **Node.js**, **Express** y **TypeScript** para la gestion de turnos y reservas. El sistema permite administrar clientes, servicios y reservas (bookings) con una arquitectura modular basada en controladores, servicios y repositorios. Utiliza **PostgreSQL** como base de datos y **Zod** para validacion de esquemas. La autenticacion se maneja con **JWT** y las contrasenas se hashean con **bcrypt**.

---

## Tabla de Contenidos

1. [Configuracion del Proyecto](#1-configuracion-del-proyecto)
   - [package.json](#packagejson)
   - [tsconfig.json](#tsconfigjson)
   - [docker-compose.yml](#docker-composeyml)
   - [.env](#env)
2. [Punto de Entrada](#2-punto-de-entrada)
   - [src/app.ts](#srcappts)
3. [Configuracion](#3-configuracion)
   - [src/config/env.config.ts](#srcconfigenvconfigts)
   - [src/config/database.config.ts](#srcconfigdaboreconfigts)
4. [Migraciones de Base de Datos](#4-migraciones-de-base-de-datos)
   - [001_services.sql](#001_servicessql)
   - [002_customers.sql](#002_customerssql)
   - [003_bookings.sql](#003_bookingssql)
5. [Modulo de Servicios](#5-modulo-de-servicios)
   - [services.entity.ts](#servicesentityts)
   - [services.repository.interface.ts](#servicesrepositoryinterfacets)
   - [services.postgres.repository.ts](#servicespostgresrepositoryts)
   - [services.controller.ts](#servicescontrollerts)
   - [services.routes.ts](#servicesroutests)
   - [services.http](#serviceshttp)
6. [Modulo de Clientes](#6-modulo-de-clientes)
   - [customers.entity.ts](#customersentityts)
   - [customers.schemas.ts](#customersschemasts)
   - [customers.postgres.repository.ts](#customerspostgresrepositoryts)
   - [customers.service.ts](#customersservicets)
   - [customers.controller.ts](#customerscontrollerts)
   - [customers.routes.ts](#customersroutests)
   - [customers.http](#customershttp)
7. [Modulo de Reservas](#7-modulo-de-reservas)
   - [bookings.entity.ts](#bookingsentityts)
   - [bookings.schemas.ts](#bookingsschemasts)
   - [bookings.postgres.repository.ts](#bookingspostgresrepositoryts)
   - [bookings.service.ts](#bookingsservicets)
   - [bookings.controller.ts](#bookingscontrollerts)
   - [bookings.routes.ts](#bookingsroutests)
   - [bookings.http](#bookingshttp)
8. [Modulo de Notificaciones](#8-modulo-de-notificaciones)
   - [notifications.service.ts](#notificationsservicets)
9. [Errores Personalizados](#9-errores-personalizados)
   - [custom-errors.ts](#custom-errorsts)
   - [DatabaseError.ts](#daboreerrorts)
10. [Middlewares](#10-middlewares)
    - [validation.middleware.ts](#validationmiddlewarets)
    - [error.middleware.ts](#errormiddlewarets)
    - [auth.middleware.ts](#authmiddlewarets)
11. [Tests](#11-tests)
    - [jest.config.js](#configuracion-de-jest)
    - [customers.schemas.test.ts](#customersschemastestts)
    - [bookings.schemas.test.ts](#bookingsschemastestts)
    - [services.controller.test.ts](#servicescontrollertestts)
    - [customers.service.test.ts](#customersservicetestts)
    - [bookings.service.test.ts](#bookingsservicetestts)
    - [custom-errors.test.ts](#custom-errorstestts)

---

## 1. Configuracion del Proyecto

### package.json

```json
{
  "name": "turno-ya",
  "version": "1.0.0",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "tsc -p ./tsconfig.json",
    "start:dev": "tsc-watch --noClear -p ./tsconfig.json --onSuccess \"node ./dist/app.js\""
  },
  "author": "",
  "license": "ISC",
  "description": "",
  "devDependencies": {
    "@types/bcrypt": "^6.0.0",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.2",
    "@types/node": "^22.15.21",
    "cors": "^2.8.5",
    "tsc-watch": "^6.0.4",
    "typescript": "^5.1.3"
  },
  "dependencies": {
    "@types/jsonwebtoken": "^9.0.10",
    "@types/pg": "^8.15.4",
    "bcrypt": "^6.0.0",
    "dotenv": "^17.2.1",
    "express": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongodb": "^6.17.0",
    "pg": "^8.16.0",
    "zod": "^4.3.6"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "incremental": true,
    "target": "es2020",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "sourceMap": true,
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "alwaysStrict": true,
    "skipLibCheck": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### docker-compose.yml

```yaml
services:
 
  postgres:
    image: postgres:15
    container_name: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db/migrations:/docker-entrypoint-initdb.d
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=turnero

volumes:

  postgres_data:
    driver: local
```

### .env

```
JWT_SECRET: process.env.JWT_SECRET || 'default_secret',
JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',
PORT: Number(process.env.PORT) || 3000,
DB_USER=postgres
DB_HOST=localhost
DB_NAME=turnero
DB_PASSWORD=postgres
DB_PORT=5432
```

---

## 2. Punto de Entrada

### src/app.ts

```typescript
import express from 'express';
import { customerRouter } from './customers/customers.routes.js';
import { bookingsRouter } from './bookings/bookings.routes.js';
import { servicesRouter } from './services/services.routes.js';

import cors from 'cors';

const app = express();

// Habilitar CORS para todas las rutas
app.use(cors({
  origin: 'http://localhost:4200', // el frontend Angular
  credentials: true
}));

app.use(express.json())

app.use('/api/customers', customerRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/services', servicesRouter)


app.listen(3000, () => {
  console.log('Server runnning on http://localhost:3000/')
})
```

---

## 3. Configuracion

### src/config/env.config.ts

```typescript
import * as dotenv from 'dotenv';

// Cargar variables de entorno desde .env
dotenv.config();

console.log('[ENV CONFIG]', {
  DB_USER: process.env.DB_USER,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_PORT: process.env.DB_PORT
});

export const envConfig = {
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',
  PORT: Number(process.env.PORT) || 3000,
  DB_USER: process.env.DB_USER || 'postgres',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_NAME: process.env.DB_NAME || 'turnero',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  DB_PORT: Number(process.env.DB_PORT) || 5432,
};
```

### src/config/database.config.ts

```typescript
// src/config/database.config.ts
import { Pool } from 'pg';
import { envConfig } from './env.config.js';



export const databaseConfig = {
  user: envConfig.DB_USER,
  host: envConfig.DB_HOST,
  database: envConfig.DB_NAME,
  password: envConfig.DB_PASSWORD,
  port: envConfig.DB_PORT,
};

console.log('[DB CONFIG]', {
  user: envConfig.DB_USER,
  host: envConfig.DB_HOST,
  database: envConfig.DB_NAME,
  password: envConfig.DB_PASSWORD,
  port: envConfig.DB_PORT,
});

export const pool = new Pool(databaseConfig);
export const query = async (text: string, params?: any[]) => pool.query(text, params);
export const connect = async () => pool.connect();
```

---

## 4. Migraciones de Base de Datos

### 001_services.sql

```sql
-- Active: 1762538321306@@127.0.0.1@5432@turnero
-- Crear tabla services
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL, 
  description TEXT NOT NULL,
  duration INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insertar servicios de ejemplo
INSERT INTO services (name, description, duration, price) VALUES
  ('Servicio 1', 'Descripcion 1', 30, 25.00),
  ('Servicio 2', 'Descripcion 2', 90, 60.00),
  ('Servicio 3', 'Descripcion 3', 45, 35.00),
  ('Servicio 4', 'Descripcion 4', 60, 20.00),
  ('Servicio 5', 'Descripcion 5', 120, 80.00);
```

### 002_customers.sql

```sql
-- Crear tabla customers
CREATE TABLE customers (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  birth_date DATE,
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'professional')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- Eliminar indice si existe
DROP INDEX IF EXISTS idx_customers_email;

-- Crear indice
CREATE INDEX idx_customers_email ON customers(email);

-- Insertar clientes con IDs especificos
INSERT INTO customers ( email, first_name, last_name, password, phone, birth_date, role) VALUES
-- Clientes pendientes de aprobacion
( 'carlos.martinez@example.com', 'Carlos', 'Martinez', '$2b$10$X1Y2Z3W4V5U6T7S8R9Q0P.', '1112345678', '1988-03-12', 'customer'),
( 'laura.sanchez@example.com', 'Laura', 'Sanchez', '$2b$10$A1B2C3D4E5F6G7H8I9J0K.', '2223456789', '1992-07-25', 'customer'),
( 'pedro.ramirez@example.com', 'Pedro', 'Ramirez', '$2b$10$L1M2N3O4P5Q6R7S8T9U0V.', '3334567890', '1985-11-30', 'customer'),
( 'marta.diaz@example.com', 'Marta', 'Diaz', '$2b$10$X1Y2Z3W4V5U6T7S8R9Q0P.', '4445678901', '1995-02-18', 'customer'),
( 'jose.garcia@example.com', 'Jose', 'Garcia', '$2b$10$A1B2C3D4E5F6G7H8I9J0K.', '5556789012', '1987-09-05', 'customer'),

-- Clientes aprobados
( 'maria.fernandez@example.com', 'Maria', 'Fernandez', '$2b$10$L1M2N3O4P5Q6R7S8T9U0V.', '6667890123', '1991-04-22', 'customer'),
( 'luis.lopez@example.com', 'Luis', 'Lopez', '$2b$10$X1Y2Z3W4V5U6T7S8R9Q0P.', '7778901234', '1989-12-15', 'customer'),
( 'carmen.ruiz@example.com', 'Carmen', 'Ruiz', '$2b$10$A1B2C3D4E5F6G7H8I9J0K.', '8889012345', '1993-06-08','customer'),

-- Clientes rechazados
( 'javier.moreno@example.com', 'Javier', 'Moreno', '$2b$10$L1M2N3O4P5Q6R7S8T9U0V.', '9990123456', '1986-10-30', 'customer'),
( 'sara.alvarez@example.com', 'Sara', 'Alvarez', '$2b$10$X1Y2Z3W4V5U6T7S8R9Q0P.', '0001234567', '1994-01-17', 'customer'),

-- Profesional (unico)
( 'profesional@example.com', 'Dr. Maria', 'Lopez', '$2b$10$L1M2N3O4P5Q6R7S8T9U0V.', '5551234567', '1975-03-10','professional');
```

### 003_bookings.sql

```sql
-- Crear tabla bookings
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES customers(id),
  client_name VARCHAR(100) NOT NULL,
  service_id INTEGER NOT NULL REFERENCES services(id),
  service_name VARCHAR(100) NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  booking_status VARCHAR(20) NOT NULL CHECK (booking_status IN ('confirmed', 'cancelled', 'completed', 'pending')),
  treatment_id UUID UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Eliminar indices si existen
DROP INDEX IF EXISTS idx_bookings_date;
DROP INDEX IF EXISTS idx_bookings_treatment_id;

-- Crear indices
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_treatment_id ON bookings(treatment_id);

-- Insertar datos de prueba con IDs explicitos
INSERT INTO bookings ( client_id, client_name, service_id, service_name, booking_date, start_time, end_time, booking_status, treatment_id) VALUES
  ( 1, 'Carlos Martinez', 1, 'Servicio 1', '2025-08-01', '09:00', '09:30', 'confirmed', gen_random_uuid()),
  ( 2, 'Laura Sanchez', 2, 'Servicio 2', '2025-08-01', '14:00', '14:45', 'pending', gen_random_uuid()),
  ( 1, 'Carlos Martinez', 3, 'Servicio 3', '2025-08-02', '10:00', '11:00', 'confirmed', gen_random_uuid());
```

---

## 5. Modulo de Servicios

### services.entity.ts

```typescript
export class Services {

  constructor(
    public id: number,
    public name: string,
    public description: string,
    public duration: number,
    public price: number,
    public image_url: string,
    public created_at: Date,
    public updated_at: Date,
  ) {}

}
```

### services.repository.interface.ts

```typescript
import { Services } from './services.entity';

export interface ServicesRepository {
  findAll(): Promise<Services[] | undefined>;
  findOne(id: string): Promise<Services | undefined>;
  add(service: Services): Promise<Services>;
  update(id: string, service: Services): Promise<Services | undefined>;
  partialUpdate(id: string, updates: Partial<Services>): Promise<Services | undefined>;
  delete(id: string): Promise<Services | undefined>;
}
```

### services.postgres.repository.ts

```typescript
import { pool } from '../config/database.config.js';
import { Services } from './services.entity.js';
import { ServicesRepository } from "./services.repository.interface.js";

export class ServicesPostgresRepository implements ServicesRepository {
  constructor() {}

  async findAll(): Promise<Services[] | undefined> {
    const result = await pool.query('SELECT * FROM services');
    return result.rows as Services[] || undefined;
  }

  async findOne(id: string): Promise<Services | undefined> {
    const result = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
    return result.rows[0] as Services || undefined;
  }

  async update(id: string, service: Services): Promise<Services | undefined> {
    const result = await pool.query(
      'UPDATE services SET name = $1, description = $2, duration = $3, price = $4, image_url = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [service.name, (service as any).description, (service as any).duration, service.price, service.image_url, id]
    );
    return result.rows[0] as Services || undefined;
  }

  async partialUpdate(id: string, updates: Partial<Services>): Promise<Services | undefined> {
    const fields = [];
    const values = [];
    let index = 1;
    for (const key in updates) {
      fields.push(`${key} = $${index}`);
      values.push((updates as any)[key]);
      index++;
    }
    values.push(id);
    const query = `UPDATE services SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${index} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0] as Services || undefined;
  }

  async delete(id: string): Promise<Services | undefined> {
    const result = await pool.query('DELETE FROM services WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] as Services || undefined;
  }

  async add(service: Services): Promise<Services> {
    const result = await pool.query(
      'INSERT INTO services (name, description, duration, price, image_url, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
      [service.name, (service as any).description, (service as any).duration, service.price, service.image_url]
    );
    return result.rows[0] as Services;
  }

}
```

### services.controller.ts

```typescript
import { Request, Response } from 'express';
import { Services } from './services.entity.js';
import { ServicesRepository } from './services.repository.interface.js';

export class ServicesController {
  private readonly servicesRepository: ServicesRepository;

  constructor(servicesRepository: ServicesRepository) {
    this.servicesRepository = servicesRepository;
    this.findAllservices = this.findAllservices.bind(this);
    this.addService = this.addService.bind(this);
    this.findServiceById = this.findServiceById.bind(this);
    this.updateService = this.updateService.bind(this);
    this.partialUpdateService = this.partialUpdateService.bind(this);
    this.deleteService = this.deleteService.bind(this);
  }

  async findAllservices(req: Request, res: Response): Promise<void> {
    const services = await this.servicesRepository.findAll();
    res.json(services);
  }

  async findServiceById(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const service = await this.servicesRepository.findOne(id);
    if (service) {
      res.json(service);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  }

  async addService(req: Request, res: Response): Promise<void> {
    const serviceData: Services = req.body;
    const newService = await this.servicesRepository.add(serviceData);
    res.status(201).json(newService);
  }

  async updateService(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const serviceData: Services = req.body;
    // Si el body trae id y no coincide con la ruta, rechazar
    if ((serviceData as any).id && (serviceData as any).id !== id) {
      res.status(400).json({ message: 'El id del body no coincide con el id de la ruta' });
      return;
    }
    const updatedService = await this.servicesRepository.update(id, serviceData);
    if (updatedService) {
      res.json(updatedService);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  }

  async partialUpdateService(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const updates: Partial<Services> = req.body;
    const updatedService = await this.servicesRepository.partialUpdate(id, updates);
    if (updatedService) {
      res.json(updatedService);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  }

  async deleteService(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    try {
      const deletedService = await this.servicesRepository.delete(id);
      if (deletedService) {
        res.json(deletedService);
      } else {
        res.status(404).json({ message: 'Service not found' });
      }
    } catch (error: any) {
      if (error.code === '23503') {
        res.status(409).json({ message: 'No se puede eliminar: el servicio tiene reservas asociadas.' });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
}
```

### services.routes.ts

```typescript
import { Router } from 'express';
import { ServicesController } from './services.controller.js';
import { ServicesPostgresRepository } from './services.postgres.repository.js';

export const servicesRouter = Router();

// Instanciar repositorio y controlador (similar a customers.routes)
const servicesRepository = new ServicesPostgresRepository();
const servicesController = new ServicesController(servicesRepository as any);

// Rutas relativas — se montaran en /api/services desde app.ts
servicesRouter.get('/', servicesController.findAllservices);
servicesRouter.get('/:id', servicesController.findServiceById);
servicesRouter.put('/:id', servicesController.updateService);
servicesRouter.patch('/:id', servicesController.partialUpdateService);
servicesRouter.delete('/:id', servicesController.deleteService);
servicesRouter.post('/', servicesController.addService);

export default servicesRouter;
```

### services.http

```http
### Obtener todos los servicios
GET http://localhost:3000/api/services

### Obtener un servicio por ID
GET http://localhost:3000/api/services/1

### Update un servicio por ID
PUT http://localhost:3000/api/services/1
Content-Type: application/json

{
  "name": "Updated Service",
  "description": "This is an updated service",
  "duration": 45,
  "price": "80.00",
  "category_id": "2",
  "image_url": "http://example.com/updated_image.jpg"
}

### Update parcial de un servicio por ID
PATCH http://localhost:3000/api/services/1
Content-Type: application/json

{
  "price": "90.00",
  "duration": 50
}

### Crear un nuevo servicio
POST http://localhost:3000/api/services
Content-Type: application/json

{
  "name": "New Service",
  "description": "This is a new service",
  "duration": 60,
  "price": "100.00",
  "category_id": "1",
  "image_url": "http://example.com/image.jpg"
}

#### Eliminar un servicio por ID
DELETE http://localhost:3000/api/services/4
```

---

## 6. Modulo de Clientes

### customers.entity.ts

```typescript
export interface Customer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  password: string,
  phone?: string;
  birth_date?: string;
  role: 'customer' | 'professional';
  created_at: string;
  updated_at: string;
}
```

### customers.schemas.ts

```typescript
import { z } from 'zod';

// Helper para validar que no haya 3+ caracteres consecutivos iguales
const noRepeatedChars = (str: string): boolean => {
  // Regex: detecta 3 o mas caracteres iguales consecutivos
  const repeatedPattern = /(.)\1{2,}/;
  return !repeatedPattern.test(str);
};

// Helper para validar fecha de nacimiento
const validateBirthDate = (dateString: string): boolean => {
  const birthDate = new Date(dateString);
  const today = new Date();
  
  if (birthDate > today) return false;
  
  const minDate = new Date('1900-01-01');
  if (birthDate < minDate) return false;
  
  return true;
};

// Schema para crear customer
export const createCustomerSchema = z.object({
  first_name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'El nombre solo puede contener letras')
    .refine(noRepeatedChars, 'El nombre no puede tener 3 o mas letras iguales consecutivas')
    .trim(),
  
  last_name: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'El apellido solo puede contener letras')
    .refine(noRepeatedChars, 'El apellido no puede tener 3 o mas letras iguales consecutivas')
    .trim(),
  
  email: z.string()
    .email('Email invalido')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(8, 'La contrasena debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayuscula')
    .regex(/[a-z]/, 'Debe contener al menos una minuscula')
    .regex(/[0-9]/, 'Debe contener al menos un numero'),
  
  phone: z.string()
    .regex(/^\+?[0-9]{10,15}$/, 'Telefono invalido')
    .optional(),
  
  birth_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha invalido (YYYY-MM-DD)')
    .refine(validateBirthDate, 'La fecha de nacimiento no puede ser futura ni anterior a 1900')
    .optional()
});

// Schema para actualizar
export const updateCustomerSchema = z.object({
  first_name: z.string()
    .min(2).max(50)
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
    .refine(noRepeatedChars, 'El nombre no puede tener 3 o mas letras iguales consecutivas')
    .trim()
    .optional(),
  
  last_name: z.string()
    .min(2).max(50)
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
    .refine(noRepeatedChars, 'El apellido no puede tener 3 o mas letras iguales consecutivas')
    .trim()
    .optional(),
  
  phone: z.string().regex(/^\+?[0-9]{10,15}$/).optional(),
  
  birth_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(validateBirthDate, 'La fecha de nacimiento no puede ser futura ni anterior a 1900')
    .optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Debes proporcionar al menos un campo para actualizar'
});

// Schema para validar ID en params
export const idParamSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, 'ID debe ser un numero entero positivo')
    .transform(Number)
});

// Tipos inferidos desde los schemas
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
```

### customers.postgres.repository.ts

```typescript
import { pool } from '../config/database.config.js';
import { Customer } from './customers.entity.js';
import { UpdateCustomerInput } from './customers.schemas.js';
import { ConflictError, NotFoundError } from '../errors/custom-errors.js';

export class CustomersPostgresRepository {

  async countBookingsForCustomer(customerId: number): Promise<number> {
    const query = `SELECT COUNT(*) AS total FROM bookings WHERE client_id = $1`;
    const result = await pool.query(query, [customerId]);
    return Number(result.rows[0].total);
  }

  async findById(id: number): Promise<Customer | null> {
    const query = 'SELECT * FROM customers WHERE id = $1';
    const { rows } = await pool.query<Customer>(query, [id]);
    return rows[0] || null;
  }

  async findAll(): Promise<Customer[]> {
    const query = `
      SELECT
        id,
        first_name || ' ' || last_name AS name,
        email, phone, created_at
      FROM customers
      ORDER BY id
    `;
    const { rows } = await pool.query<Customer>(query);
    return rows;
  }

  async create(data: Partial<Customer>): Promise<Customer> {
    const query = `
      INSERT INTO customers (
        first_name, last_name, email, password, phone, birth_date, role
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const params = [
      data.first_name, data.last_name,
      data.email, data.password,
      data.phone ?? null, data.birth_date ?? null,
      data.role
    ];

    try {
      const { rows } = await pool.query<Customer>(query, params);
      return rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictError('El email ya esta registrado');
      }
      throw error;
    }
  }

  async update(id: number, data: UpdateCustomerInput): Promise<Customer> {

    const customer = await this.findById(id);
    if (!customer) throw new NotFoundError('Cliente'); // por si se llama directo sin pasar por service

    const merged = {
      first_name: data.first_name ?? customer.first_name,
      last_name: data.last_name ?? customer.last_name,
      phone: data.phone ?? customer.phone,
      birth_date: data.birth_date ?? customer.birth_date,
      email: customer.email,
      password: customer.password,
      role: customer.role
    };

    const query = `
      UPDATE customers SET
        first_name = $1, last_name = $2, email = $3,
        password = $4, phone = $5, birth_date = $6,
        role = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

    const params = [
      merged.first_name, merged.last_name, merged.email,
      merged.password, merged.phone, merged.birth_date,
      merged.role, id
    ];

    const { rows } = await pool.query<Customer>(query, params);
    return rows[0];
  }

  async delete(id: number): Promise<void> {
    try {
      await pool.query('DELETE FROM customers WHERE id = $1', [id]);
    } catch (err: any) {
      console.error('[Repository] Error eliminando cliente:', err);
      if (err.code === '23503') {
        throw new ConflictError('El cliente tiene reservas asociadas');
      }
      throw err; 
    }
  }
}
```

### customers.service.ts

```typescript
import { CustomersPostgresRepository } from './customers.postgres.repository.js';
import { Customer } from './customers.entity.js';
import { CreateCustomerInput, UpdateCustomerInput } from './customers.schemas.js';
import { NotFoundError, ValidationError } from '../errors/custom-errors.js';
import bcrypt from 'bcrypt';

export class CustomersService {
  private readonly SALT_ROUNDS = 10;

  constructor(private customersRepository: CustomersPostgresRepository) {}


  // Obtiene todos los clientes
  async getAllCustomers(): Promise<Customer[]> {
    return await this.customersRepository.findAll();
  }

  

  // Obtiene cliente por ID
  async getCustomerById(id: number): Promise<Customer> {
    const customer = await this.customersRepository.findById(id);
    
    if (!customer) {
      throw new NotFoundError('Cliente');
    }

    return customer;
  }

  
  async createCustomer(data: CreateCustomerInput): Promise<Customer> {
    console.log('[Service] createCustomer - Hasheando password...');
    
    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    const customerData = {
      ...data,
      password: hashedPassword,
      role: 'customer' as const
    };

    console.log('[Service] Data preparada (password oculto)');

    return await this.customersRepository.create(customerData);
  }

  // Actualiza cliente
  async updateCustomer(id: number, data: UpdateCustomerInput): Promise<Customer> {
    const existing = await this.customersRepository.findById(id);

    if (!existing) {
      throw new NotFoundError('Cliente');
    }

    return await this.customersRepository.update(id, data);
  }

  // Elimina cliente
  async deleteCustomer(id: number): Promise<void> {
    console.log('[Service] Eliminando cliente', id);

    const existing = await this.customersRepository.findById(id);

    if (!existing) {
      throw new NotFoundError('Cliente');
    }

    await this.customersRepository.delete(id);
    console.log('[Service] Cliente eliminado OK');
  }
}
```

### customers.controller.ts

```typescript
import { Request, Response } from 'express';
import { CustomersService } from './customers.service.js';
import { CustomersPostgresRepository } from './customers.postgres.repository.js';
import { AppError } from '../errors/custom-errors.js';

export class CustomersController {
  private customersService: CustomersService;

  constructor() {
    const repository = new CustomersPostgresRepository();
    this.customersService = new CustomersService(repository);
  }

  // GET /api/customers/all
  async getAllCustomers(req: Request, res: Response): Promise<void> {
    try {
      console.log('[CustomersController] getAllCustomers');
      const customers = await this.customersService.getAllCustomers();
      res.status(200).json({ data: customers });
    } catch (error) {
      this.handleError(res, error);
    }
  }


  // GET /api/customers/:id 
  async getCustomerById(req: Request, res: Response): Promise<void> {
    try {
      console.log('[CustomersController] getCustomerById');
      const { id } = req.params;
      
      const customer = await this.customersService.getCustomerById(Number(id));

      res.status(200).json({ data: customer });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // PUT /api/customers/:id
  async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      const updated = await this.customersService.updateCustomer(Number(id), data);
      res.status(200).json({ data: updated });

    } catch (error) {
      this.handleError(res, error);
    }
  }

  // POST /api/customers
  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      console.log('---- [Controller] POST /api/customers ----');
      const data = req.body;

      console.log('[Controller] Llamando al service.createCustomer...');
      const newCustomer = await this.customersService.createCustomer(data);
      console.log('[Controller] Cliente creado con ID:', newCustomer.id);

      res.status(201).json({ data: newCustomer });
    } catch (error: any) {
      if (error.code === '23505' && error.constraint === 'customers_email_key') {
        res.status(400).json({
          error: {
            message: 'El email ya esta registrado',
            code: 'EMAIL_DUPLICATE',
            status: 400,
          }
        });
        return;
      }

      this.handleError(res, error);
    }
  }

  // DELETE /api/customers/:id
  async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      console.log('[Controller] DELETE /customers/', id);

      await this.customersService.deleteCustomer(Number(id));

      console.log('[Controller] Cliente eliminado OK');
      res.status(204).send();

    } catch (error) {
      this.handleError(res, error);
    }
  }

  // Metodo centralizado para manejar errores
  private handleError(res: Response, error: unknown): void {
    console.error('[Controller] Error:', error);

    if (error instanceof AppError) {
      const appError = error as AppError;
      res.status(appError.statusCode).json({
        error: {
          message: appError.message,
          code: appError.code,
          status: appError.statusCode
        }
      });
      return;
    }

    res.status(500).json({
      error: {
        message: 'Error interno del servidor',
        code: 'SERVER_ERROR',
        status: 500
      }
    });
  }
}
```

### customers.routes.ts

```typescript
import { Router } from 'express';
import { CustomersController } from './customers.controller.js';
import { validate, validateParams } from '../middleware/validation.middleware.js';
import {
  createCustomerSchema,
  updateCustomerSchema,
  idParamSchema
} from './customers.schemas.js';

export const customerRouter = Router();
const customersController = new CustomersController();

// GET /api/customers/all
customerRouter.get(
  '/all',
  customersController.getAllCustomers.bind(customersController)
);

// GET /api/customers/:id
customerRouter.get(
  '/:id',
  validateParams(idParamSchema),
  customersController.getCustomerById.bind(customersController)
);

// POST /api/customers
customerRouter.post(
  '/',
  validate(createCustomerSchema),
  customersController.createCustomer.bind(customersController)
);

// PUT /api/customers/:id
customerRouter.put(
  '/:id',
  validateParams(idParamSchema),
  validate(updateCustomerSchema),
  customersController.updateCustomer.bind(customersController)
);


// DELETE /api/customers/:id
customerRouter.delete(
  '/:id',
  validateParams(idParamSchema),
  customersController.deleteCustomer.bind(customersController)
);

export default customerRouter;
```

### customers.http

```http
################################################################################
# PRUEBAS DE VALIDACION DE CLIENTES (HU14)
#
# Este archivo cubre el flujo completo para probar la aprobacion y rechazo de
# clientes pendientes por parte de un profesional.
#
# Antes de empezar, ejecutar el endpoint de inicializacion para resetear la base
# de datos con los datos de prueba.
################################################################################

### Inicializar la base de datos con datos de prueba
# Ejecutar este paso antes de comenzar cualquier prueba.
POST http://localhost:3000/api/setup/database
Content-Type: application/json

{}

################################################################################
### 1. Obtener lista de usuarios pendientes
# Verificar que haya inicialmente 5 usuarios pendientes. (Va a aparecer el log en la terminal)
################################################################################

GET http://localhost:3000/api/customers/pending
x-user-id: 11

################################################################################
# FIN DEL FLUJO DE PRUEBAS
# Para volver a empezar, ejecutar nuevamente el endpoint de inicializacion al comienzo del archivo.
################################################################################

POST http://localhost:3000/api/customers
Content-Type: application/json

{
  "first_name": "Juan",
  "last_name": "Perez",
  "email": "juan@example.com",
  "password": "123456",
  "phone": "3411234567",
  "birth_date": "1990-05-10",
  "role": "customer"
}

#####

DELETE http://localhost:3000/api/customers/1
x-user-id: 11
```

---

## 7. Modulo de Reservas

### bookings.entity.ts

```typescript
import crypto from 'node:crypto';

export class Booking {
  constructor(
    public id: number,
    public client_id: number,
    public client_name: string,
    public service_id: number,
    public service_name: string,
    public booking_date: Date,
    public start_time: string,
    public end_time: string,
    public booking_status: 'confirmed' | 'cancelled' | 'completed' | 'pending',
    public treatment_id: string = crypto.randomUUID(),
    public created_at: Date = new Date(),
    public updated_at: Date = new Date(),
  ) {}
}
```

### bookings.schemas.ts

```typescript
import { z } from 'zod';

// Helper para validar fecha del turno
const validateBookingDate = (dateString: string): boolean => {
  const bookingDate = new Date(dateString);
  const today = new Date();

  if (bookingDate < today) return false;

  return true;
};

// Schema para actualizar
export const updateBookingSchema = z.object({
  client_id: z.coerce.number().int().positive().optional(),
  client_name: z.string().min(1).optional(),
  service_id: z.coerce.number().int().positive().optional(),
  service_name: z.string().min(1).optional(),


  booking_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(validateBookingDate, 'La fecha del turno no puede ser anterior a hoy')
    .optional(),


  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato de hora invalido').optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato de hora invalido').optional(),

  booking_status: z.enum(['confirmed', 'cancelled', 'completed', 'pending']).optional(),

  treatment_id: z.string().optional()
})
  .refine(data => Object.keys(data).length > 0, {
    message: 'Debes proporcionar al menos un campo para actualizar'
  });

// Schema para validar ID en params
export const idParamSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, 'ID debe ser un numero entero positivo')
    .transform(Number)
});

// Schema para crear un nuevo turno
export const createBookingSchema = z.object({
  client_id: z.coerce.number().int().positive({ message: 'El ID del cliente debe ser un numero positivo' }),
  client_name: z.string().min(1, 'El nombre del cliente es requerido').trim(),

  service_id: z.coerce.number().int().positive({ message: 'El ID del servicio debe ser un numero positivo' }),
  service_name: z.string().min(1, 'El nombre del servicio es requerido').trim(),

  booking_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha invalido (YYYY-MM-DD)')
    .refine(validateBookingDate, 'La fecha del turno no puede ser anterior a hoy'),



  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato de hora invalido'),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato de hora invalido'),

  booking_status: z.enum(['confirmed', 'cancelled', 'completed', 'pending']).default('pending'),

  treatment_id: z.array(z.string()).optional()
})
  .refine(data => data.end_time > data.start_time, {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['end_time']
  });


// Tipos inferidos desde los schemas
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
```

### bookings.postgres.repository.ts

```typescript
import { Booking } from './bookings.entity.js';
import { pool } from '../config/database.config.js';
import { CreateBookingInput, UpdateBookingInput } from './bookings.schemas.js';
import { ConflictError } from '../errors/custom-errors.js';

const ALLOWED_FIELDS: (keyof UpdateBookingInput)[] = [
  'client_id',
  'client_name',
  'service_id',
  'service_name',
  'booking_date',
  'start_time',
  'end_time',
  'booking_status',
  'treatment_id'
];

export class BookingsPostgresRepository {

  async add(data: CreateBookingInput): Promise<Booking> {
    const query = `
      INSERT INTO bookings (
        client_id, client_name, service_id, service_name,
        booking_date, start_time, end_time, booking_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const params = [
      data.client_id, data.client_name,
      data.service_id, data.service_name,
      data.booking_date, data.start_time,
      data.end_time, data.booking_status
    ];

    try {
      const { rows } = await pool.query<Booking>(query, params);
      return rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictError('Ya existe un turno con esos datos');
      }
      throw error;
    }
  }

  async findById(id: number): Promise<Booking | null> {
    const query = 'SELECT * FROM bookings WHERE id = $1';
    const { rows } = await pool.query<Booking>(query, [id]);
    return rows[0] || null;
  }

  async findAll(): Promise<Booking[]> {
    const query = `
      SELECT
        b.id, b.client_id, b.client_name,
        b.service_id, s.name AS service_name,
        b.booking_date, b.start_time, b.end_time,
        b.booking_status, b.treatment_id,
        b.updated_at, b.created_at
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      ORDER BY b.id
    `;
    const { rows } = await pool.query<Booking>(query);
    return rows;
  }

  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
  }

  async update(id: number, data: UpdateBookingInput): Promise<Booking | null> {
    const filteredEntries = Object.entries(data).filter(
      ([key]) => ALLOWED_FIELDS.includes(key as keyof UpdateBookingInput)
    );

    if (filteredEntries.length === 0) return null;

    const fields = filteredEntries.map(([key]) => key);
    const values = filteredEntries.map(([, value]) => value);

    const setClause = fields
      .map((field, index) => `${field} = $${index + 1}`)
      .join(', ');

    const query = `
      UPDATE bookings
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${fields.length + 1}
      RETURNING *;
    `;

    const result = await pool.query(query, [...values, id]);
    if (result.rows.length === 0) return null;

    const u = result.rows[0];
    return new Booking(
      u.id, u.client_id, u.client_name,
      u.service_id, u.service_name,
      u.booking_date, u.start_time, u.end_time,
      u.booking_status, u.treatment_id,
      u.created_at, u.updated_at
    );
  }
}
```

### bookings.service.ts

```typescript
import { BookingsPostgresRepository } from './bookings.postgres.repository.js';
import { Booking } from './bookings.entity.js';
import { CreateBookingInput, UpdateBookingInput } from './bookings.schemas.js';
import { ConflictError, NotFoundError, ValidationError } from '../errors/custom-errors.js';


export class BookingsService {

    constructor(private bookingsRepository: BookingsPostgresRepository) { }

    async addBooking(newBooking: CreateBookingInput): Promise<Booking> {
        return await this.bookingsRepository.add(newBooking);
    }

    async getAllBookings(): Promise<Booking[]> {
        return await this.bookingsRepository.findAll();
    }

    async getBookingById(id: number): Promise<Booking> {
        const booking = await this.bookingsRepository.findById(id);

        if (!booking) {
            throw new NotFoundError('Turno');
        }

        return booking;
    }

    async deleteBooking(id: number): Promise<void> {

        console.log('[BookingsService] deleteBooking - ID:', id);

        const booking = await this.bookingsRepository.findById(id);

        if (!booking) {
            throw new NotFoundError('Turno');
        }

        if (booking.booking_status !== 'cancelled') {
            throw new ConflictError('Solo se pueden eliminar turnos cancelados');
        }

        await this.bookingsRepository.delete(id);
        console.log('[BookingsService] Turno eliminado OK');
    }


    async updateBooking(id: number, data: UpdateBookingInput): Promise<Booking> {
        const existing = await this.bookingsRepository.findById(id);

        if (!existing) {
            throw new NotFoundError('Turno');
        }

        const updated = await this.bookingsRepository.update(id, data);

        if (!updated) {
            throw new Error('Error al actualizar el turno');
        }

        return updated;
    }


}
```

### bookings.controller.ts

```typescript
import { Request, Response } from 'express';
import { BookingsPostgresRepository } from './bookings.postgres.repository.js';
import { BookingsService } from './bookings.service.js';
import { AppError } from '../errors/custom-errors.js';

export class BookingsController {
  private bookingsService: BookingsService;

  constructor() {
    const repository = new BookingsPostgresRepository();
    this.bookingsService = new BookingsService(repository);
  }

  async addBooking(req: Request, res: Response): Promise<void> {
    try {
      console.log('---- [Controller] POST /api/bookings ----');
      const newBooking = await this.bookingsService.addBooking(req.body);
      console.log('[Controller] Turno creado con ID:', newBooking.id);
      res.status(201).json({ data: newBooking });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getAllBookings(req: Request, res: Response): Promise<void> {
    try {
      console.log('[BookingsController] getAllBookings');
      const bookings = await this.bookingsService.getAllBookings();
      res.status(200).json({ data: bookings });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getBookingById(req: Request, res: Response): Promise<void> {
    try {
      console.log('[BookingsController] getBookingById');
      const { id } = req.params;
      const booking = await this.bookingsService.getBookingById(Number(id));
      res.status(200).json({ data: booking });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log('[Controller] DELETE /bookings/', id);
      await this.bookingsService.deleteBooking(Number(id));
      console.log('[Controller] Turno eliminado OK');
      res.status(204).send();
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log('[UPDATE] Body recibido:', JSON.stringify(req.body));
      const updated = await this.bookingsService.updateBooking(Number(id), req.body);
      res.status(200).json({ data: updated });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private handleError(res: Response, error: unknown): void {
    console.error('[Controller] Error:', error);

    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        error: {
          message: error.message,
          code: error.code,
          status: error.statusCode
        }
      });
      return;
    }

    res.status(500).json({
      error: {
        message: 'Error interno del servidor',
        code: 'SERVER_ERROR',
        status: 500
      }
    });
  }
}
```

### bookings.routes.ts

```typescript
import { Router } from 'express';
import { BookingsController } from './bookings.controller.js';
import { validate, validateParams } from '../middleware/validation.middleware.js';
import {
   updateBookingSchema,
   createBookingSchema,
   idParamSchema
 } from './bookings.schemas.js';

export const bookingsRouter = Router();
const bookingsController = new BookingsController();

// Definicion de rutas
bookingsRouter.get('/all', bookingsController.getAllBookings.bind(bookingsController));
bookingsRouter.get('/:id', validateParams(idParamSchema), bookingsController.getBookingById.bind(bookingsController));
bookingsRouter.post('/', validate(createBookingSchema), bookingsController.addBooking.bind(bookingsController));
bookingsRouter.put('/:id', validateParams(idParamSchema), validate(updateBookingSchema), bookingsController.updateBooking.bind(bookingsController));
bookingsRouter.delete( '/:id', validateParams(idParamSchema), bookingsController.deleteBooking.bind(bookingsController));

export default bookingsRouter;
```

### bookings.http

```http
### Obtener las reservas diarias de un profesional (HU10)
GET http://localhost:3000/api/bookings/professional/bookings?date=2025-08-02
// Authorization: Bearer <your-jwt-token>

### Booking service HU03
POST http://localhost:3000/api/bookings
Content-Type: application/json

{
  "client_id": 1,
  "service_id": 2,
  "booking_date": "2025-08-07",
  "start_time": "09:00",
  "end_time": "11:00",
  "booking_status": "pending"
}

### Consultar reservas
GET http://localhost:3000/api/bookings
```

---

## 8. Modulo de Notificaciones

### notifications.service.ts

```typescript
//# Servicio para orquestar creacion y envio de notificaciones
import { pool } from '../config/database.config.js';

export interface NotificationPayload {
  userId: number;
  message: string;
  type: 'email' | 'sms' | 'push';
}

export const notificationsService = {
  async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      // Guardar la notificacion en la base de datos
      const query = `
        INSERT INTO notifications (user_id, message, type, status)
        VALUES ($1, $2, $3, 'pending')
        RETURNING id
      `;
      const { rows } = await pool.query(query, [
        payload.userId,
        payload.message,
        payload.type
      ]);
      
      const notificationId = rows[0].id;
      
      // Aqui iria la logica real de envio (email, SMS, etc.)
      // Por ahora simulamos el envio exitoso
      console.log(`Enviando notificacion ${notificationId} a usuario ${payload.userId}: ${payload.message}`);
      
      // Actualizar estado a enviado
      await pool.query(
        'UPDATE notifications SET status = $1 WHERE id = $2',
        ['sent', notificationId]
      );
    } catch (error) {
      console.error('Error al enviar notificacion:', error);
      // No lanzamos el error para no interrumpir el flujo principal
    }
  }
};
```

---

## 9. Errores Personalizados

### custom-errors.ts

```typescript
// Error base
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Errores especificos
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} no encontrado`, `${resource.toUpperCase()}_NOT_FOUND`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 'UNAUTHORIZED', 401);
  }
}
```

### DatabaseError.ts

```typescript
export class DatabaseError extends Error {
  public code: string;
  public status: number;

  constructor(message: string, code = 'DB_ERROR', status = 500) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.status = status;

    // Mantener el stack trace limpio
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }
}
```

---

## 10. Middlewares

### validation.middleware.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Middleware para validar body
export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar y sanitizar el body
      const validated = await schema.parseAsync(req.body);
      
      // Reemplazar body con datos validados
      req.body = validated;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: {
            message: 'Error de validacion',
            code: 'VALIDATION_ERROR',
            status: 400,
            details: error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }
        });
        return;
      }
      
      res.status(500).json({
        error: {
          message: 'Error interno del servidor',
          code: 'SERVER_ERROR',
          status: 500
        }
      });
    }
  };
};

// Middleware para validar params
export const validateParams = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.params);
      req.params = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: {
            message: 'Parametros invalidos',
            code: 'INVALID_PARAMS',
            status: 400,
            details: error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }
        });
        return;
      }
      next(error);
    }
  };
};
```

### error.middleware.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import { DatabaseError } from '../errors/DatabaseError';

export const errorMiddleware = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof DatabaseError) {
    return res.status(err.status).json({ error: err.message, code: err.code });
  }

  console.error('[Unhandled Error]', err);
  return res.status(500).json({
    error: 'Error interno del servidor',
    code: 'INTERNAL_ERROR',
  });
};
```

### auth.middleware.ts

```typescript
/*import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.config.js';

interface Customer {
  id: number;
  email: string; 
  role: string;
  status: string;
}

export interface AuthenticatedRequest extends Request {
  customer?: Customer;
}

export const authMiddleware = (roles: string[] = []) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const customerId = req.headers['x-user-id'] as string;
    
    if (!customerId) {
      res.status(401).json({ error: { message: 'ID de usuario no proporcionado', code: 'USER_ID_MISSING', status: 401 } });
      return;
    }

    try {
      const query = 'SELECT id, email, role, status FROM customers WHERE id = $1';
      const { rows } = await pool.query(query, [parseInt(customerId)]);
      
      if (rows.length === 0) {
        res.status(401).json({ error: { message: 'Usuario no encontrado', code: 'USER_NOT_FOUND', status: 401 } });
        return;
      }

      const customer = rows[0] as Customer;

      if (customer.status !== 'approved') {
        res.status(403).json({ error: { message: 'Acceso denegado: usuario no aprobado', code: 'AUTH_NOT_APPROVED', status: 403 } });
        return;
      }

      if (roles.length > 0 && !roles.includes(customer.role)) {
        res.status(403).json({ error: { message: 'Acceso denegado: rol insuficiente', code: 'AUTH_FORBIDDEN', status: 403 } });
        return;
      }

      req.customer = customer; 
      next();
    } catch (error) {
      console.error('[AuthMiddleware] Error:', error instanceof Error ? error.message : String(error), error instanceof Error ? error.stack : '');
      res.status(500).json({ error: { message: 'Error del servidor', code: 'SERVER_ERROR', status: 500, cause: error instanceof Error ? error.message : String(error) } });
    }
  };
};*/
```

---

## 11. Tests

El proyecto utiliza **Jest** con **ts-jest** para testing. Los tests estan organizados en `src/__tests__/` siguiendo la estructura de modulos.

### Configuracion de Jest

```javascript
// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/app.ts',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};
```

### Comandos de Test

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con cobertura
npm run test:coverage
```

### customers.schemas.test.ts

```typescript
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
    });
  });

  describe('updateCustomerSchema', () => {
    
    it('debe aceptar actualizacion parcial', () => {
      const validData = { first_name: 'Carlos' };
      const result = updateCustomerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('debe rechazar objeto vacio', () => {
      const invalidData = {};
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
      }
    });

    it('debe rechazar ID no numerico', () => {
      const invalidData = { id: 'abc' };
      const result = idParamSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
```

### bookings.schemas.test.ts

```typescript
import { createBookingSchema, updateBookingSchema, idParamSchema } from '../../bookings/bookings.schemas.js';

describe('Booking Schemas', () => {
  
  const getFutureDate = (daysAhead: number = 7): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().split('T')[0];
  };

  describe('createBookingSchema', () => {
    
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

  describe('updateBookingSchema', () => {
    
    it('debe aceptar actualizacion parcial de status', () => {
      const validData = { booking_status: 'confirmed' };
      const result = updateBookingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('debe rechazar objeto vacio', () => {
      const invalidData = {};
      const result = updateBookingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
```

### services.controller.test.ts

```typescript
import { Request, Response } from 'express';
import { ServicesController } from '../../services/services.controller.js';
import { ServicesRepository } from '../../services/services.repository.interface.js';
import { Services } from '../../services/services.entity.js';

const mockServicesRepository: jest.Mocked<ServicesRepository> = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  add: jest.fn(),
  update: jest.fn(),
  partialUpdate: jest.fn(),
  delete: jest.fn(),
};

const mockRequest = () => ({ params: {}, body: {} } as Partial<Request>);
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
    1, 'Corte de pelo', 'Corte profesional', 30, 1500,
    'http://example.com/image.jpg', new Date(), new Date()
  );

  describe('findAllservices', () => {
    it('debe retornar todos los servicios', async () => {
      mockServicesRepository.findAll.mockResolvedValue([sampleService]);
      await controller.findAllservices(req as Request, res as Response);
      expect(res.json).toHaveBeenCalledWith([sampleService]);
    });
  });

  describe('findServiceById', () => {
    it('debe retornar un servicio por ID', async () => {
      req.params = { id: '1' };
      mockServicesRepository.findOne.mockResolvedValue(sampleService);
      await controller.findServiceById(req as Request, res as Response);
      expect(res.json).toHaveBeenCalledWith(sampleService);
    });

    it('debe retornar 404 si el servicio no existe', async () => {
      req.params = { id: '999' };
      mockServicesRepository.findOne.mockResolvedValue(null);
      await controller.findServiceById(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteService', () => {
    it('debe retornar 409 si el servicio tiene reservas asociadas', async () => {
      req.params = { id: '1' };
      mockServicesRepository.delete.mockRejectedValue({ code: '23503' });
      await controller.deleteService(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(409);
    });
  });
});
```

### customers.service.test.ts

```typescript
import { CustomersService } from '../../customers/customers.service.js';
import { CustomersPostgresRepository } from '../../customers/customers.postgres.repository.js';
import { NotFoundError } from '../../errors/custom-errors.js';
import bcrypt from 'bcrypt';

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
    } as unknown as jest.Mocked<CustomersPostgresRepository>;
    
    service = new CustomersService(mockRepository);
    jest.clearAllMocks();
  });

  describe('getCustomerById', () => {
    it('debe lanzar NotFoundError si el cliente no existe', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(service.getCustomerById(999)).rejects.toThrow(NotFoundError);
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
      
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockRepository.create.mockResolvedValue({ id: 1, ...createInput } as any);

      await service.createCustomer(createInput);

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 10);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'customer' })
      );
    });
  });
});
```

### bookings.service.test.ts

```typescript
import { BookingsService } from '../../bookings/bookings.service.js';
import { BookingsPostgresRepository } from '../../bookings/bookings.postgres.repository.js';
import { NotFoundError, ConflictError } from '../../errors/custom-errors.js';

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

  const sampleBooking = {
    id: 1,
    client_id: 1,
    client_name: 'Juan Perez',
    service_id: 1,
    service_name: 'Corte de pelo',
    booking_date: '2025-06-15',
    start_time: '10:00',
    end_time: '11:00',
    booking_status: 'pending' as const,
    treatment_id: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  describe('deleteBooking', () => {
    it('debe eliminar una reserva cancelada', async () => {
      const cancelledBooking = { ...sampleBooking, booking_status: 'cancelled' as const };
      mockRepository.findById.mockResolvedValue(cancelledBooking);
      mockRepository.delete.mockResolvedValue(undefined);

      await expect(service.deleteBooking(1)).resolves.toBeUndefined();
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('debe lanzar ConflictError si la reserva no esta cancelada', async () => {
      mockRepository.findById.mockResolvedValue(sampleBooking);
      await expect(service.deleteBooking(1)).rejects.toThrow(ConflictError);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});
```

### custom-errors.test.ts

```typescript
import { 
  AppError, NotFoundError, ValidationError, 
  ConflictError, UnauthorizedError 
} from '../../errors/custom-errors.js';

describe('Custom Errors', () => {
  
  describe('NotFoundError', () => {
    it('debe crear error con recurso especificado', () => {
      const error = new NotFoundError('Cliente');
      expect(error.message).toBe('Cliente no encontrado');
      expect(error.code).toBe('CLIENTE_NOT_FOUND');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('ValidationError', () => {
    it('debe crear error de validacion', () => {
      const error = new ValidationError('El email es invalido');
      expect(error.message).toBe('El email es invalido');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('ConflictError', () => {
    it('debe crear error de conflicto', () => {
      const error = new ConflictError('El email ya esta registrado');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('UnauthorizedError', () => {
    it('debe crear error con mensaje por defecto', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('No autorizado');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('Error inheritance', () => {
    it('todos los errores deben ser instanceof AppError', () => {
      const errors = [
        new NotFoundError('Test'),
        new ValidationError('test'),
        new ConflictError('test'),
        new UnauthorizedError(),
      ];
      errors.forEach(error => expect(error).toBeInstanceOf(AppError));
    });
  });
});
```

---

## Estructura de Directorios

```
turno-ya-backend/
├── db/
│   └── migrations/
│       ├── 001_services.sql
│       ├── 002_customers.sql
│       └── 003_bookings.sql
├── src/
│   ├── __tests__/
│   │   ├── bookings/
│   │   │   ├── bookings.schemas.test.ts
│   │   │   └── bookings.service.test.ts
│   │   ├── customers/
│   │   │   ├── customers.schemas.test.ts
│   │   │   └── customers.service.test.ts
│   │   ├── errors/
│   │   │   └── custom-errors.test.ts
│   │   └── services/
│   │       ├── services.controller.test.ts
│   │       └── services.entity.test.ts
│   ├── bookings/
│   │   ├── bookings.controller.ts
│   │   ├── bookings.entity.ts
│   │   ├── bookings.http
│   │   ├── bookings.postgres.repository.ts
│   │   ├── bookings.routes.ts
│   │   ├── bookings.schemas.ts
│   │   └── bookings.service.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   └── env.config.ts
│   ├── customers/
│   │   ├── customers.controller.ts
│   │   ├── customers.entity.ts
│   │   ├── customers.http
│   │   ├── customers.postgres.repository.ts
│   │   ├── customers.routes.ts
│   │   ├── customers.schemas.ts
│   │   └── customers.service.ts
│   ├── errors/
│   │   ├── custom-errors.ts
│   │   └── DatabaseError.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── notifications/
│   │   └── notifications.service.ts
│   ├── services/
│   │   ├── services.controller.ts
│   │   ├── services.entity.ts
│   │   ├── services.http
│   │   ├── services.postgres.repository.ts
│   │   ├── services.repository.interface.ts
│   │   └── services.routes.ts
│   └── app.ts
├── .env
├── .gitignore
├── docker-compose.yml
├── jest.config.js
├── package.json
├── README.md
└── tsconfig.json
```
