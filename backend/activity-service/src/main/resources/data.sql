-- ACTIVIDADES SOLIDARIAS - DATOS DE PRUEBA
INSERT INTO activities (titulo, description, tipo_actividad, coordinador_id, fecha_inicio, fecha_fin, estado_actividad)
VALUES
('Campaña de Donación de Ropa', 'Recolecta de abrigo para invierno', 'DONACION', 1, '2025-10-20 09:00:00', '2025-10-20 18:00:00', 'ABIERTO'),

('Limpieza de Espacios Públicos', 'Actividad de limpieza en la plaza central', 'VOLUNTARIADO', 2, '2025-10-10 08:00:00', '2025-10-10 14:00:00', 'FINALIZADO'),

('Reforestación Urbana', 'Plantación de árboles nativos', 'VOLUNTARIADO', 3, '2025-10-17 10:00:00', '2025-10-17 16:00:00', 'EN_CURSO'),

('Taller de Educación Ambiental', 'Capacitación para estudiantes sobre reciclaje', 'TALLER', 4, '2025-11-02 14:00:00', '2025-11-02 17:00:00', 'PENDIENTE'),

('Colecta de Alimentos', 'Jornada suspendida por mal clima', 'TALLER', 1, '2025-10-15 09:00:00', '2025-10-15 17:00:00', 'SUSPENDIDO');

-- DATOS DE PRUEBA PARA TABLAS INTERMEDIAS
INSERT INTO activity_participants (activity_id, user_id)
VALUES
(1, 2),
(1, 3),
(2, 2),
(3, 3),
(4, 2),
(5, 3);