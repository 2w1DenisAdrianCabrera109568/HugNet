-- ACTIVIDADES SOLIDARIAS - DATOS DE PRUEBA
INSERT INTO activities (titulo, description, fecha_inicio, fecha_fin, tipo_actividad, coordinador_id)
VALUES
('Campaña de Abrigo 2025', 'Recolección de ropa de invierno para comunidades rurales.', '2025-05-10', '2025-05-20', 'DONACION', 1),
('Jornada de Limpieza Costera', 'Voluntariado ambiental para limpieza de playas locales.', '2025-06-01', '2025-06-01','DONACION', 1),
('Feria Solidaria', 'Evento para intercambio de útiles escolares.', '2025-07-15', '2025-07-16','DONACION', 1),
('Colecta de Alimentos', 'Campaña solidaria junto a supermercados locales.', '2025-08-05', '2025-08-12', 'DONACION', 1),
('Charlas de Concientización Ambiental', 'Taller educativo sobre reciclaje y consumo responsable.', '2025-09-01', '2025-09-01','DONACION', 1);



-- DATOS DE PRUEBA PARA TABLAS INTERMEDIAS
INSERT INTO activity_participants (activity_id, user_id)
VALUES
(1, 2),
(1, 3),
(2, 2),
(3, 3),
(4, 2),
(5, 3);