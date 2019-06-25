---
templateKey: blog-post
title: Dessiner une ville à la main avec TileMill (2 - Découper 340 000 polygones)
date: 2017-02-04T14:04:10.000Z
description: Comme nous l'avons vu dans un précédent article, la création d'une carte urbaine reproduisant un style crayonné repose sur la superposition de plusieurs effets - code sous TileMill, textures sous Gimp... Nous allons nous intéresser aujourd'hui à une intervention plus en amont - le découpage des polygones de bâtiments directement dans la base de données PostGIS.
tags:
  - carto
  - tilemill
---

Cette carte de Toulouse a été créée à partir de données provenant de OpenStreetMap ; la zone affichée se situe à Toulouse et ses environs.

## La donne

En m'imaginant comment je dessinerais moi-même cette carte, à l'échelle des quartiers, je me suis dit que j'aurais travaillé en différentes étapes. Tout d'abord une ébauche rapide au crayon des bâtiments, avec des formes plutôt arrondies (utilisant le line-smooth).

Puis à l'aide d'une règle j'aurais tracé les contours des maisons. Seulement une ville comme Toulouse en contient beaucoup... (environ 450 000 habitants). J'aurais donc sacrifié un peu de précision pour tout tracer.

Et que fait-on quand on est pressé en dessin ? On déborde, on dépasse ! Mais cette notion n'est pas connue des moteurs de rendu SIG. Il m'a donc fallu modifier cette donnée à la source, dans PostGIS.
Les données

Téléchargés depuis OpenStreetMap, les polygones (tous confondus : bâtiments, zones administratives, parcs, fleuves...) se trouvent dans la table planet_osm_polygon. Les bâtiments sont identifiables par l'attribut 'building'='yes'. Il y en a 342 790 en tout.

Je vais suivre deux étapes pour parvenir à mon but :

  - découper les polygones en linestring
  - agrandir ces nouvelles lignes

## Découper les polygones

Techniquement, si je veux pouvoir prolonger chaque trait de manière à ce qu'il déborde, il me d'abord découper les polygones en lignes distinctes, que je pourrai ensuite manipuler comme je le veux.

En cherchant sur le web, je trouve un article qui me donne la solution : "[How to convert polygon data into line segments using PostGIS](https://stackoverflow.com/questions/7595635/how-to-convert-polygon-data-into-line-segments-using-postgis)".

Je crée donc une nouvelle table (que je nomme poly2line) :

```sql
CREATE TABLE poly2line (
 id serial NOT NULL,
 way geometry(LineString,900913),
 long_way geometry(LineString,900913),
 type text,
 CONSTRAINT poly2line_pkey PRIMARY KEY (id)
)
```

Puis j'applique ce script qui va s'intéresser à chaque segment rectiligne composant le polygone, pour créer de nouvelles lignes distinctes :

```
INSERT INTO poly2line (way)
SELECT ST_MakeLine(sp,ep)
FROM
-- extract the endpoints for every 2-point line segment for each linestring
(SELECT
 ST_PointN(geom, generate_series(1, ST_NPoints(geom)-1)) as sp,
 ST_PointN(geom, generate_series(2, ST_NPoints(geom) )) as ep
 FROM
 -- extract the individual linestrings
 (SELECT (ST_Dump(ST_Boundary(way))).geom
 FROM planet_osm_polygon WHERE building IS NOT NULL
 ) AS linestrings
) AS segments
```

Ces lignes, toujours fidèles au tracé original, sont stockées dans le champ 'way'. J'obtiens à partir des 342 790 bâtiments 2 440 585 lignes.

Je ne suis pas plus avancé pour l'instant : si j'affiche ces éléments dans TileMill, ils ont exactement le même aspect que les polygones d'origine.

## Agrandir les lignes 

Il me faut maintenant trouver une méthode pour agrandir ces lignes. Là encore, en cherchant sur internet, je trouve une piste intéressante : "[postgis, extrapolate a line](https://gis.stackexchange.com/questions/33055/extrapolating-a-line-in-postgis)".

Je crée une fonction afin d'appliquer cette méthode à toutes les lignes :

```
CREATE OR REPLACE FUNCTION agrandir_ligne(ligne geometry)
RETURNS geometry AS $$
DECLARE A geometry;
DECLARE B geometry;
DECLARE azimuthA double precision;
DECLARE azimuthB double precision;
DECLARE length double precision;
DECLARE newlengthA double precision;
DECLARE newlengthB double precision;
DECLARE newA geometry;
DECLARE newB geometry;
BEGIN

-- crée des points A et B aux extrémités de la ligne
A := ST_STARTPOINT(ligne);
B := ST_ENDPOINT(ligne);

-- récupère 2 directions : de B vers A, puis de A vers B
azimuthA := ST_AZIMUTH(B,A);
azimuthB := ST_AZIMUTH(A,B);

-- récupère la longueur entre les points A et B et définition d'une nouvelle longueur à ajouter
length := ST_DISTANCE(A,B);
newlengthA := length/5;
newlengthB := length/5;

-- crée un nouveau point A et un nouveau point B dans la direction déterminée et dans un rapport de 1/x de la longueur d'origine
newA := ST_TRANSLATE(A, sin(azimuthA) * newlengthA, cos(azimuthA) * newlengthA);
newB := ST_TRANSLATE(B, sin(azimuthB) * newlengthB, cos(azimuthB) * newlengthB);

-- crée une ligne entre ces 2 nouveaux points
RETURN ST_Makeline(newA,newB);

END;
$$ LANGUAGE plpgsql;
```

Ma première tentative était trop régulière, car je n'avais pas inclus d'élément aléatoire : toutes les lignes dépassaient de 1/5 de leur longueur d'origine. J'ai donc ajouté dans la déclaration des variables newlengthA et newlengthB une valeur aléatoire : random(), qui génère un nombre de 0.0 à 1.0.

```
newlengthA := (length/5)*random();
newlengthB := (length/5)*random();
```

Les lignes stockées dans le champ 'way' sont ainsi traitées et enregistrées dans le champ 'long_way', qui sera appelé dans une couche sous TileMill.

Après [quelques paramétrages de rendu sous TileMill](https://datatheca.com/blog/generation-procedurale-de-tuiles-1) nous arrivons donc à ce résultat :

![](/img/blog/dessin-toulouse-decoupage-des-batiments.jpeg)

