-- Usuarios del sistema
INSERT INTO users (user_id, nombre, apellido, email, password, rol, activo)
VALUES
  (10, 'Lucía', 'Pérez', 'lucia.perez@example.com', '1234', 'ADMINISTRADOR', true),
  (20, 'Carlos', 'Ramírez', 'carlos.ramirez@example.com', 'abcd', 'COORDINADOR', true),
  (30, 'María', 'López', 'maria.lopez@example.com', 'pass', 'USUARIO', true),
  (40, 'Javier', 'Torres', 'javier.torres@example.com', 'clave', 'USUARIO', true),
  (50, 'Andrea', 'Gómez', 'andrea.gomez@example.com', 'admin', 'COORDINADOR', true);
