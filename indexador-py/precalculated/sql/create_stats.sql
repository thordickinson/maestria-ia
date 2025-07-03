CREATE TABLE region_stats (
    tipo_region VARCHAR(20) NOT NULL,         -- 'barrio', 'upz', 'localidad'
    codigo VARCHAR(50) NOT NULL,             -- gid o código
    nombre VARCHAR(255) NOT NULL,           -- nombre de la región
    estadisticas_propiedades JSONB NOT NULL,
    PRIMARY KEY (tipo_region, codigo)
);
