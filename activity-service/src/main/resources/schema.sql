
DROP TABLE IF EXISTS activities;
CREATE TABLE activities (
    activity_Id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    description TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    tipo_actividad VARCHAR(100) NOT NULL,
    coordinador_id BIGINT NOT NULL
);

DROP TABLE IF EXISTS activity_participants;
CREATE TABLE activity_participants (
    activity_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (activity_id, user_id)
);