---
templateKey: blog-post
title: Dessiner une ville à la main avec TileMill (3 – Occupation des sols et cours d'eau)
date: 2017-03-03T09:32:11.000Z
description: Nous avons vu comment représenter les bâtiments. Je m'intéresse maintenant à la mise en forme des zones d'occupation des sols et des cours d'eau pour finaliser la représentation de Toulouse et des villes environnantes.
tags:
  - carto
  - tilemill
---

Cette carte de Toulouse a été créée à partir de données provenant de OpenStreetMap ; la zone affichée se situe à Toulouse et ses environs.

## Affichage des zones d'occupation des sols

Je choisis de simplifier la représentation de l'occupation des sols en grands groupes : residentiel, commercial, industriel, naturel :

```
SELECT ST_Simplify(way,50) as way,landuse,way_area,
CASE
WHEN landuse = 'residential' THEN 'residential'
WHEN landuse IN ('commercial','retail') THEN 'commercial'
WHEN landuse = 'industrial' THEN 'industrial'
WHEN landuse = 'cemetery' THEN 'cemetery'
WHEN landuse IN ('farm','farmland','farmyard','forest','grass','vineyard') THEN 'natural'
ELSE 'autres'
END AS type
FROM (SELECT * FROM planet_osm_polygon WHERE landuse IS NOT NULL) as zones
```

Je crée des textures sous GIMP que j'applique aux couches concernées.

![](https://makina-corpus.com/blog/metier/images/dessin-toulouse-zones-trames)

Les bords sont trop rectilignes, j'ajoute deux contours avec du line-smooth afin de casser cela :

```
#zones {
    ::outline1 {
         line-smooth:2;
         line-color:@crayon;
         line-width:1;
         [zoom>=15] {line-width:0.4;}
         line-opacity:0.5;
    }
    ::outline2 [zoom<15] {
         line-smooth:3;
         line-color:@crayon;
         line-width:0.8;
         line-opacity:0.3;
    }
}
```

![](https://makina-corpus.com/blog/metier/images/copy_of_dessintlsart3zonestramescontours.jpg)

## Affichage des cours d'eau

Sans intervention ces tracés sont très rectilignes. Ce sont sans doute les plus difficiles à « casser ». Etant donné que les cours d'eau ont tendance à traverser une carte entière, ils attirent davantage l'attention que des éléments plus ponctuels.

![](https://makina-corpus.com/blog/metier/images/dessintlsart3eaux.jpg)

Plutôt qu'appliquer une couleur de fond, je crée une nouvelle texture de crayonnage, beaucoup moins dense :

![](https://makina-corpus.com/blog/metier/images/dessin-toulouse-eaux-textures)

Le résultat ne plaît pas encore : les bords sont trop lisses. Je crée donc une deuxième requête PostGIS, pour appeler les mêmes données avec un buffer :

```
SELECT ST_Buffer(way,50) as way, waterway AS type FROM planet_osm_polygon WHERE waterway='riverbank'
```

J'applique à cette couche une nouvelle texture basée sur la première, mais encore plus légère :

![](https://makina-corpus.com/blog/metier/images/dessintlsart3eauxtexturesbuffer.jpg)

J'arrive ainsi au résultat que je cherche : la reproduction d'un crayonnage rapide, débordant des limites d'origine. Je n'ai ensuite plus qu'à appliquer un contour.

![](https://makina-corpus.com/blog/metier/images/dessin-toulouse-eaux-contours)

Je peux maintenant assembler toutes les données sélectionnées : types d'occupation des sols, cours d'eau, bâtiments...

![](https://makina-corpus.com/blog/metier/images/dessin-toulouse-final)



 