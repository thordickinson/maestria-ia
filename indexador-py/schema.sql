-- public.avaluo_catastral_manzana definition

-- Drop table

-- DROP TABLE public.avaluo_catastral_manzana;

CREATE TABLE public.avaluo_catastral_manzana (
	gid serial4 NOT NULL,
	objectid float8 NULL,
	manzana_id varchar(254) NULL,
	cp_terr_ar varchar(254) NULL,
	grupop_ter varchar(254) NULL,
	avaluo_com numeric NULL,
	avaluo_cat numeric NULL,
	observacio varchar(254) NULL,
	globalid varchar(38) NULL,
	shape_leng numeric NULL,
	shape_area numeric NULL,
	geom public.geometry(multipolygon, 4326) NULL,
	CONSTRAINT avaluo_catastral_manzana_pkey PRIMARY KEY (gid)
);
CREATE INDEX avaluo_catastral_manzana_geom_idx ON public.avaluo_catastral_manzana USING gist (geom);


-- public.barrios_bogota definition

-- Drop table

-- DROP TABLE public.barrios_bogota;

CREATE TABLE public.barrios_bogota (
	gid serial4 NOT NULL,
	fid int4 NULL,
	barrio varchar(80) NULL,
	municipio varchar(80) NULL,
	localidad varchar(80) NULL,
	predomin_1 int4 NULL,
	tipobarrio varchar(80) NULL,
	tot_vivien int4 NULL,
	cod varchar(80) NULL,
	casas int4 NULL,
	aptos int4 NULL,
	condomi int4 NULL,
	shape__are numeric NULL,
	shape__len numeric NULL,
	geom public.geometry(multipolygon, 4326) NULL,
	CONSTRAINT barrios_bogota_pkey PRIMARY KEY (gid)
);
CREATE INDEX barrios_bogota_geom_idx ON public.barrios_bogota USING gist (geom);


-- public.destinoshp definition

-- Drop table

-- DROP TABLE public.destinoshp;

CREATE TABLE public.destinoshp (
	gid serial4 NOT NULL,
	objectid float8 NULL,
	mancodigo varchar(10) NULL,
	lotcodigo varchar(50) NULL,
	destinocod varchar(2) NULL,
	destinodes varchar(254) NULL,
	ano date NULL,
	shape_area numeric NULL,
	shape_len numeric NULL,
	geom public.geometry(multipolygon, 4326) NULL,
	CONSTRAINT destinoshp_pkey PRIMARY KEY (gid)
);
CREATE INDEX destinoshp_geom_idx ON public.destinoshp USING gist (geom);


-- public.estaciones_transmilenio definition

-- Drop table

-- DROP TABLE public.estaciones_transmilenio;

CREATE TABLE public.estaciones_transmilenio (
	gid serial4 NOT NULL,
	objectid int2 NULL,
	numero_est varchar(5) NULL,
	nombre_est varchar(44) NULL,
	coordenada numeric NULL,
	coordena_1 numeric NULL,
	ubicacion_ varchar(29) NULL,
	troncal_es varchar(13) NULL,
	numero_vag int2 NULL,
	numero_acc int2 NULL,
	biciestaci varchar(1) NULL,
	capacidad_ int2 NULL,
	tipo_estac int2 NULL,
	biciparque int2 NULL,
	latitud_es numeric NULL,
	longitud_e numeric NULL,
	codigo_nod int4 NULL,
	componente varchar(17) NULL,
	componen_1 varchar(17) NULL,
	globalid varchar(38) NULL,
	created_us varchar(1) NULL,
	created_da date NULL,
	last_edite varchar(13) NULL,
	last_edi_1 date NULL,
	log_replic varchar(1) NULL,
	id_trazado varchar(5) NULL,
	geom public.geometry(point, 4326) NULL,
	CONSTRAINT estaciones_transmilenio_pkey PRIMARY KEY (gid)
);
CREATE INDEX estaciones_transmilenio_geom_idx ON public.estaciones_transmilenio USING gist (geom);


-- public.estratos_manzana definition

-- Drop table

-- DROP TABLE public.estratos_manzana;

CREATE TABLE public.estratos_manzana (
	gid int4 DEFAULT nextval('estratos_gid_seq'::regclass) NOT NULL,
	objectid float8 NULL,
	codigo_man varchar(9) NULL,
	estrato int4 NULL,
	codigo_zon float8 NULL,
	codigo_cri varchar(4) NULL,
	normativa varchar(6) NULL,
	acto_admin varchar(4) NULL,
	numero_act float8 NULL,
	fecha_acto date NULL,
	escala_cap varchar(10) NULL,
	fecha_capt date NULL,
	responsabl varchar(4) NULL,
	shape_area numeric NULL,
	shape_len numeric NULL,
	geom public.geometry(multipolygon, 4326) NULL,
	CONSTRAINT estratos_pkey PRIMARY KEY (gid)
);
CREATE INDEX estratos_geom_idx ON public.estratos_manzana USING gist (geom);


-- public.geohash_stats definition

-- Drop table

-- DROP TABLE public.geohash_stats;

CREATE TABLE public.geohash_stats (
	geohash varchar(16) NOT NULL,
	lat float8 NOT NULL,
	lng float8 NOT NULL,
	region_info jsonb NULL,
	nearby_places jsonb NULL,
	valuation jsonb NULL,
	calculation_time_seconds float8 NULL,
	CONSTRAINT geohash_stats_pkey PRIMARY KEY (geohash)
);


-- public.gis_osm_pois_a_free_1 definition

-- Drop table

-- DROP TABLE public.gis_osm_pois_a_free_1;

CREATE TABLE public.gis_osm_pois_a_free_1 (
	gid serial4 NOT NULL,
	osm_id varchar(12) NULL,
	code int2 NULL,
	fclass varchar(28) NULL,
	"name" varchar(100) NULL,
	geom public.geometry(multipolygon, 4326) NULL,
	CONSTRAINT gis_osm_pois_a_free_1_pkey PRIMARY KEY (gid)
);
CREATE INDEX gis_osm_pois_a_free_1_geom_idx ON public.gis_osm_pois_a_free_1 USING gist (geom);


-- public.gis_osm_pois_free_1 definition

-- Drop table

-- DROP TABLE public.gis_osm_pois_free_1;

CREATE TABLE public.gis_osm_pois_free_1 (
	gid serial4 NOT NULL,
	osm_id varchar(12) NULL,
	code int2 NULL,
	fclass varchar(28) NULL,
	"name" varchar(100) NULL,
	geom public.geometry(point, 4326) NULL,
	CONSTRAINT gis_osm_pois_free_1_pkey PRIMARY KEY (gid)
);
CREATE INDEX gis_osm_pois_free_1_geom_idx ON public.gis_osm_pois_free_1 USING gist (geom);


-- public.infraestructura_turistica_liviana definition

-- Drop table

-- DROP TABLE public.infraestructura_turistica_liviana;

CREATE TABLE public.infraestructura_turistica_liviana (
	gid serial4 NOT NULL,
	idsenal float8 NULL,
	localidad varchar(254) NULL,
	seccatastr varchar(254) NULL,
	atractivo varchar(254) NULL,
	tiposenal varchar(254) NULL,
	ubsenal varchar(254) NULL,
	anoinstal float8 NULL,
	latitud numeric NULL,
	longitud numeric NULL,
	geom public.geometry(point, 4326) NULL,
	CONSTRAINT infraestructura_turistica_liviana_pkey PRIMARY KEY (gid)
);
CREATE INDEX infraestructura_turistica_liviana_geom_idx ON public.infraestructura_turistica_liviana USING gist (geom);


-- public.localidades_bogota definition

-- Drop table

-- DROP TABLE public.localidades_bogota;

CREATE TABLE public.localidades_bogota (
	gid serial4 NOT NULL,
	locnombre varchar(50) NULL,
	locaadmini varchar(50) NULL,
	locarea numeric NULL,
	loccodigo varchar(2) NULL,
	shape_leng numeric NULL,
	shape_area numeric NULL,
	geom public.geometry(multipolygon, 4326) NULL,
	CONSTRAINT localidades_bogota_pkey PRIMARY KEY (gid)
);
CREATE INDEX localidades_bogota_geom_idx ON public.localidades_bogota USING gist (geom);


-- public.monumentos definition

-- Drop table

-- DROP TABLE public.monumentos;

CREATE TABLE public.monumentos (
	gid serial4 NOT NULL,
	objectid float8 NULL,
	consecut_1 float8 NULL,
	localidad varchar(254) NULL,
	titulo varchar(254) NULL,
	clasificac varchar(254) NULL,
	direccion varchar(254) NULL,
	autor varchar(254) NULL,
	fecha_elab varchar(254) NULL,
	x numeric NULL,
	y numeric NULL,
	geom public.geometry(point, 4326) NULL,
	CONSTRAINT monumentos_pkey PRIMARY KEY (gid)
);
CREATE INDEX monumentos_geom_idx ON public.monumentos USING gist (geom);


-- public.paraderos_sitp definition

-- Drop table

-- DROP TABLE public.paraderos_sitp;

CREATE TABLE public.paraderos_sitp (
	gid serial4 NOT NULL,
	objectid_1 float8 NULL,
	object_id float8 NULL,
	cenefa varchar(10) NULL,
	consec_par varchar(5) NULL,
	modulo_par varchar(5) NULL,
	zona_par int4 NULL,
	nombre_par varchar(80) NULL,
	via_par varchar(30) NULL,
	direcc_par varchar(50) NULL,
	locali_par int4 NULL,
	consola_pa varchar(50) NULL,
	panel_par varchar(50) NULL,
	audio_par varchar(60) NULL,
	longitud numeric NULL,
	latitud numeric NULL,
	coor_x numeric NULL,
	coor_y numeric NULL,
	geom public.geometry(point, 4326) NULL,
	CONSTRAINT paraderos_sitp_pkey PRIMARY KEY (gid)
);
CREATE INDEX paraderos_sitp_geom_idx ON public.paraderos_sitp USING gist (geom);


-- public.sector_catastral definition

-- Drop table

-- DROP TABLE public.sector_catastral;

CREATE TABLE public.sector_catastral (
	gid serial4 NOT NULL,
	scacodigo varchar(6) NULL,
	scatipo float8 NULL,
	scanombre varchar(60) NULL,
	shape_leng numeric NULL,
	shape_area numeric NULL,
	geom public.geometry(multipolygon, 4326) NULL,
	CONSTRAINT sector_catastral_pkey PRIMARY KEY (gid)
);
CREATE INDEX sector_catastral_geom_idx ON public.sector_catastral USING gist (geom);


-- public.shape definition

-- Drop table

-- DROP TABLE public.shape;

CREATE TABLE public.shape (
	gid serial4 NOT NULL,
	objectid float8 NULL,
	manzana_id varchar(254) NULL,
	cp_terr_ar varchar(254) NULL,
	grupop_ter varchar(254) NULL,
	avaluo_com numeric NULL,
	avaluo_cat numeric NULL,
	observacio varchar(254) NULL,
	globalid varchar(38) NULL,
	shape_leng numeric NULL,
	shape_area numeric NULL,
	geom public.geometry(multipolygon, 4326) NULL,
	CONSTRAINT shape_pkey PRIMARY KEY (gid)
);
CREATE INDEX shape_geom_idx ON public.shape USING gist (geom);


-- public.spatial_ref_sys definition

-- Drop table

-- DROP TABLE public.spatial_ref_sys;

CREATE TABLE public.spatial_ref_sys (
	srid int4 NOT NULL,
	auth_name varchar(256) NULL,
	auth_srid int4 NULL,
	srtext varchar(2048) NULL,
	proj4text varchar(2048) NULL,
	CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid),
	CONSTRAINT spatial_ref_sys_srid_check CHECK (((srid > 0) AND (srid <= 998999)))
);


-- public.upz_bogota definition

-- Drop table

-- DROP TABLE public.upz_bogota;

CREATE TABLE public.upz_bogota (
	gid serial4 NOT NULL,
	objectid varchar(255) NULL,
	codigo_upz varchar(255) NULL,
	nombre varchar(255) NULL,
	zona_estaci varchar(255) NULL,
	decreto_pot varchar(255) NULL,
	decreto varchar(255) NULL,
	codigo_loca varchar(255) NULL,
	shape_area numeric NULL,
	shape_len numeric NULL,
	codigo_id varchar(255) NULL,
	escala_capt varchar(255) NULL,
	fecha_captu varchar(255) NULL,
	responsable varchar(255) NULL,
	globalid varchar(255) NULL,
	geom public.geometry(multipolygon, 4326) NULL,
	CONSTRAINT upz_bogota_pkey PRIMARY KEY (gid)
);
CREATE INDEX upz_bogota_geom_idx ON public.upz_bogota USING gist (geom);


-- public.valor_ref_2022 definition

-- Drop table

-- DROP TABLE public.valor_ref_2022;

CREATE TABLE public.valor_ref_2022 (
	gid serial4 NOT NULL,
	objectid float8 NULL,
	mancodigo varchar(254) NULL,
	v_ref numeric NULL,
	ano date NULL,
	shape_leng numeric NULL,
	shape_area numeric NULL,
	geom public.geometry(multipolygon, 4326) NULL,
	CONSTRAINT valor_ref_2022_pkey PRIMARY KEY (gid)
);
CREATE INDEX valor_ref_2022_geom_idx ON public.valor_ref_2022 USING gist (geom);
