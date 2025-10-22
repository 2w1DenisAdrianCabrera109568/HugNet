DROP TABLE IF EXISTS activity_sponsors;
DROP TABLE IF EXISTS sponsors;

-- Crea la tabla de Sponsors
CREATE TABLE sponsors (
    sponsor_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    telefono VARCHAR(50)
);

-- Crea la tabla intermedia para la relación entre Actividades y Sponsors
CREATE TABLE activity_sponsors (
    activity_id BIGINT NOT NULL,
    sponsor_id BIGINT NOT NULL,
    PRIMARY KEY (activity_id, sponsor_id),
    FOREIGN KEY (sponsor_id) REFERENCES sponsors(sponsor_id)
);