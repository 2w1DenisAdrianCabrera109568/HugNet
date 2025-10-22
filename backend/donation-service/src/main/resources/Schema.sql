CREATE TABLE donations (
    donation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255),
    monto DOUBLE,
    cantidad INT,
    fecha TIMESTAMP,
    usuario_id BIGINT,
    activity_id BIGINT
);