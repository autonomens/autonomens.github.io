---
templateKey: blog-post
title: Dessiner une ville à la main avec TileMill (1 - Les bâtiments)
date: 2016-12-17T15:04:10.000Z
description: L'objectif de ce projet est d'afficher une carte dans un style crayonné à partir de données géométriques stockées en base de données PostgreSQL/PostGIS. Nous voyons ici comment mettre en forme les bâtiments.
tags:
  - carto
  - tilemill
---

Cette [carte de Toulouse](http://dessine-moi-une-ville.makina-corpus.net/#13/43.6000/1.4400) a été créée à partir de données provenant de OpenStreetMap ; la zone affichée se situe à Toulouse et ses environs. La réalisation est faite sans modifier les données d'origine, afin de pouvoir appliquer ces styles à d'autres emprises avec un minimum d'interventions techniques.

La majeure partie du travail résidait dans la définition d'un affichage « imparfait » des données. Il existe à priori peu de projets originaux de cartes stylisées sur le web (notamment la magnifique ['Pirate Map'](http://a.tiles.mapbox.com/v3/aj.Sketchy2/page.html#2/0.2/0.0) de AJ Ashton, mais également les [cartes historiques de Toulouse](https://makina-corpus.com/blog/metier/2013/toulouse-1680)). Pour parvenir au résultat, j'ai utilisé les possibilités du code de TileMill, celles de PostGis, et créé sous GIMP des textures adaptées.

## Automatiser l'imperfection d'un dessin manuel

Lorsqu'on dessine une carte à la main on va forcément perdre des détails, dépasser des limites, faire des tracés plus ou moins fidèles.

En utilisant des moteurs de rendu, les tracés sont rectilignes, les fonds de couleur unis :

![](/img/blog/dessin-toulouse-rendu-de-base.jpeg)

J'ai voulu automatiser un aspect manuel, en 4 étapes :

  1) modifier les tracés, afin de donner l'impression d'un coup de crayon trop rapide, qui sur un croquis aurait permis de schématiser les tracés
  2) allonger les lignes afin de reproduire un tracé rapide à la règle
  3) remplir les polygones avec du crayonnage
  4) ajout de nouvelles lignes de contour, légèrement décalées pour créer un effet de tracés de crayon

Tout cela sera appuyé par des textures créées avec Gimp, afin de reproduire un effet de coloriage et de grain de papier.

## Une première ébauche au crayon

La première étape est assez facile à réaliser : TileMill propose un attribut (line-smooth) qui amplifie les tracés.

```
line-color: lighten(@building-line-color,15%);
line-width: 0.5;
line-opacity: 0.5;
line-smooth: 0.8;
```

![](/img/blog/dessin-toulouse-effet-line-smooth.jpeg)

## Le tracé à la règle des contours de bâtiments

La seconde étape est plus complexe, car il faut pour cela intervenir dans la base de données. Les bâtiments étant des polygones, il s'agit de découper ces polygones en lignes droites (donc à chaque angle rencontré une nouvelle ligne est créée).

Ces nouvelles linestring sont enregistrées dans une table. L'emprise de la zone de travail comprend environ 344 000 bâtiments, qui sont ainsi découpés en plus de 2 440 000 lignes.

J'applique à ces lignes une fonction PostGIS qui les agrandit, de manière à ce qu'elles dépassent. Une valeur aléatoire est utilisée pour parvenir à l'imperfection recherchée (plus d'informations à ce propos dans le post "Découper 340 000 polygones").

![](/img/blog/dessin-toulouse-decoupage-des-batiments.jpeg)

## Le coloriage

Je crée une trame de fond de crayonnage en niveaux de gris et gestion de la transparence, avec GIMP (en m'aidant d'un [tutoriel](http://ladyvlana.free.fr/tutoriel-gimp-texture/tutoriel-gimp-texture-papier-01.php)) :

![](/img/blog//dessin-toulouse-texture-de-fond.jpeg)

Les couleurs de fond (en fonction du type de bâtiment) donnent ensuite l'illusion d'un coloriage réalisé avec des crayons classiques :

```css
[type='habitat'] {
polygon-fill:#3b4447;
polygon-pattern-file: url("images/trame-crayon-inv-gauche.png");
}

[type='historique'] {
polygon-fill:#9D4D26;
polygon-pattern-file: url("images/trame-crayon-inv-256.png");
}
```

## L'assemblage

Toutes les étapes préparatoires étant terminées, je superpose les différents effets, en gérant la transparence sur les différentes couches :

