CREATE TABLE reports (
    report_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo_reporte VARCHAR(100) NOT NULL,
    fecha_generacion TIMESTAMP,
    datos_reporte CLOB -- CLOB es para guardar grandes bloques de texto (como un JSON)
);