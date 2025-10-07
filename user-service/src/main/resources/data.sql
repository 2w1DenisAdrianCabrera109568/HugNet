-- Usuarios del sistema
INSERT INTO users (user_id, nombre, apellido, email, password, rol, activo)
VALUES
  (1, 'Lucía', 'Pérez', 'lucia.perez@example.com', '1234', 'ADMIN', true),
  (2, 'Carlos', 'Ramírez', 'carlos.ramirez@example.com', 'abcd', 'COORDINADOR', true),
  (3, 'María', 'López', 'maria.lopez@example.com', 'pass', 'USUARIO', true),
  (4, 'Javier', 'Torres', 'javier.torres@example.com', 'clave', 'USUARIO', true),
  (5, 'Andrea', 'Gómez', 'andrea.gomez@example.com', 'admin', 'COORDINADOR', true);
