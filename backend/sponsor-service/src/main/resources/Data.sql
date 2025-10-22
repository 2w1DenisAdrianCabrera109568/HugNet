INSERT INTO sponsors (nombre, tipo, email, telefono) VALUES
('Tech Solutions S.A.', 'EMPRESA', 'contacto@techsolutions.com', '+543511234567'),
('Librería El Saber', 'COMERCIO', 'info@elsaber.com.ar', '+543517654321'),
('Juan Pérez', 'PARTICULAR', 'juan.perez@email.com', '+543515555555');

-- Inserta relaciones de prueba en la tabla intermedia
-- Asumimos que existen actividades con IDs 1, 2 y 3 en el activity-service
INSERT INTO activity_sponsors (activity_id, sponsor_id) VALUES
(1, 1), -- La actividad 1 está patrocinada por Tech Solutions
(1, 3), -- La actividad 1 también está patrocinada por Juan Pérez
(2, 2); -- La actividad 2 está patrocinada por Librería El Saber