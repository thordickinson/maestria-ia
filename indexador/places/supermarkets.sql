SELECT *
FROM (
    SELECT code, name, ST_AsText(ST_Transform(geom, 4326)) AS location
    FROM gis_osm_pois_free_1
    WHERE fclass IN ('convenience', 'supermarket', 'market_place')
      AND ST_DWithin(
          geography(geom),
          geography(ST_SetSRID(ST_Point(:lng, :lat), 4326)),
          :radius
      )
    UNION ALL
    SELECT code, name, ST_AsText(ST_Transform(ST_Centroid(geom), 4326)) AS location
    FROM gis_osm_pois_a_free_1
    WHERE fclass IN ('convenience', 'supermarket', 'market_place')
      AND ST_DWithin(
          geography(ST_Centroid(geom)),
          geography(ST_SetSRID(ST_Point(:lng, :lat), 4326)),
          :radius
      )) AS combined WHERE name IS NOT NULL;
