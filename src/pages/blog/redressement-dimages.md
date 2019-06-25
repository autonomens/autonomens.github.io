---
templateKey: blog-post
title: Utilisation de la vision par ordinateur pour redresser des images
date: 2017-03-03T09:32:11.000Z
description: Dans un module de comparaison d'images, lorsque deux photographies ne sont pas cadrées de la même manière, non-superposable, c'est frustrant. On vous propose ici d'y remédier avec du redressement d'images par homographie.

tags:
  - image
  - traitement
---

Dans le cadre du développement d'une application, nous avons du mettre un place un module de comparaison d'images deux à deux. Le principe du comparateur est simple et efficace : un pointeur simultané permet de se situer sur les deux images à la fois, accompagné d'un zoom. Pourtant, quelque chose nous dérange, du moins ne nous satisfait pas dans ce module. Les images ne sont en effet pas cadrées de la même manière entre deux prises de vue et le pointeur montre certes le même point en termes de position sur les images mais pas géographiquement parlant.

Pour contourner ce problème, nous nous sommes donc penchés sur le redressement d'images. Il s'agit de transformer une image - de la redresser - pour qu'elle soit superposable à une celle qui lui sert de modèle. Cela peut se faire simplement en détectant dans les deux images des points saillants qui vont servir de repères pour la transformation.  
Nous utilisons Python mais plus particulièrement la bibliothèque [OpenCV](https://pypi.org/project/opencv-python/) pour arriver à bout du redressement.

![initial_images](https://makina-corpus.com/blog/metier/2019/redressement-dimage-images-de-depart-1)
_Voici les images dans le module de comparaison : le curseur ne pointe pas sur les mêmes éléments entre les deux photographies. Nous allons utiliser image de gauche comme référence et l'image de droite va être redressée._

## Première étape : les points saillants

Les points saillants sont définis par des structures de l'image qui peuvent se distinguer facilement de leur environnement. Par exemple, des changements nets de contraste ou de lumière sont souvent utilisés pour les identifier. Des points saillants typiques seraient des bordures ou des coins, caractérisés par une importante différence au niveau du contraste. À chaque point saillant détecté est associé un descripteur qui le caractérise de façon unique. Ainsi, un point saillant est censé avoir le même descripteur lorsqu'il est détecté sur une autre image, quelque soit la position et l'orientation de l'appareil photo. Il existe d'ailleurs plusieurs algorithmes de détection de points saillants qui ont sont plus ou moins sensibles aux changements de cadrage entre deux prises de vue. L'un des robustes et des plus réputés est l'algorithme [SIFT](https://robo.fish/wiki/images/5/58/Image_Features_From_Scale_Invariant_Keypoints_Lowe_2004.pdf) : il est non seulement insensible aux changements de position et d'orientation mais aussi d'échelle.  

Dans le code ci-dessous, `im_ref` et `im` font référence à nos deux images de travail. `im_ref` est notre image d'origine et nous souhaitons redresser `im` pour qu'elle corresponde à `im_ref`.


    import cv2

    # Initiate SIFT detector
    sift = cv2.xfeatures2d.SIFT_create()

    # Find keypoints and compute descriptors with SIFT
    kp_ref, des_ref = sift.detectAndCompute(im_ref, None)
    kp, des = sift.detectAndCompute(im, None)

Les variables `kpX` et `desX` correspondent respectivement aux points saillants sur l'image X (kp = _keypoint_) et à leur descripteur associé (des = _descriptor_).

![detected_keypoints](https://makina-corpus.com/blog/metier/2019/redressement-dimage-points-cles)
_Points saillants détectés_

## Association des points saillants

Maintenant que les points saillants ont été détectés sur les deux images, nous souhaitons créer les paires de points qui se ressemblent assez, d'après leur descripteur, pour considérer que ce sont les mêmes dans la réalité.  
Il existe plusieurs algorithmes pouvant réaliser cette tâche, ce sont des _Matchers_. La fonction d'association est généralement longue à s'exécuter car pour chacun des point saillants de la première image, tous les points saillants de la seconde image sont testés afin de trouver la meilleure association. Un tri a ensuite lieu pour ne garder que les associations les plus fiables.
OpenCV propose, entres autres, _Brute-Force matcher_, un algorithme assez simple qui calcule la distance entre les descripteurs des points saillants. Le point saillant le plus proche est considéré comme étant la meilleure association.

    # Create BFMatcher object with default parameters
    bf = cv2.BFMatcher()

    # Match descriptors
    matches = bf.knnMatch(des, des_ref, k=2)

    # Store all the good matches as per Lowe's ratio test
    # Can play with variable factor:
    # if factor = 1, all matches are taken into account,  if factor = 0 none of them are considered
    good_matches = []
    factor = 0.6
    for m, n in matches:
        if m.distance < factor * n.distance:
            good_matches.append(m)

    # Retrieve your keypoints in `good_matches`
    good_kp = np.array([kp[match.queryIdx].pt for match in good_matches])
    good_kp_ref = np.array([kp_ref[match.trainIdx].pt for match in good_matches])

![matching_keypoints](https://makina-corpus.com/blog/metier/2019/redressement-dimage-matching)
_Association des points saillants entre deux images_

## Finalement, le redressement

Les paires de points saillants établies à l'étape précédente nous permettent maintenant de déduire la transformation qu'il existe entre les deux images. On appelle cette transformation homographie (ou par son nom barbare : application projective bijective). Concrètement, cela signifie que tout élément dans notre image non transformée apparaîtra, de façon unique, dans l'image transformée. De plus, les éléments conserveront leur typologie : un point reste un point, un ligne reste une ligne et un polygone reste un polygone ! Ainsi, les objets de l'image ne disparaissent pas (ou ne sont pas dédoublés) et gardent leur nature d'origine lors de la transformation.  
Appliquons la transformation homographique à l'image qui doit être redressée :

    # Find transformation
    m, mask = cv2.findHomography(good_kp, good_kp_ref, cv2.RANSAC, 5.0)

    # Apply transformation
    im_adjusted = cv2.warpPerspective(im, m, (w, h))

Dans le code ci-dessus, `w` et `h` représentent la largeur (_width_) et la hauteur (_height_) de sortie de l'image transformée. 
La première étape est de trouver, à partir des points saillants associés précédemment, la matrice définissant l'homographie. L'algorithme RANSAC (Random Sample Consensus) est ici appelé pour supprimer les éventuelles associations aberrantes. Le paramètre égal à `5.0` correspond à la tolérance de l'algorithme RANSAC pour détecter ces associations. Nous obtenons alors la matrice de transformation `m`.  Celle-ci nous permet alors de passer à la deuxième étape, l'application de l'homographie sur l'image !

![redressement](https://makina-corpus.com/blog/metier/2019/redressement-dimage-overlay)
_Superposition des images avant redressement (à gauche) et après redressement (à droite)_

## Conclusion

Ce traitement nous a permis de redresser notre image par rapport à une image de référence afin d'avoir un cadrage similaire. Voici un aperçu du module de comparaison avec l'image redressée, le curseur pointe bien sur le même élément dans les deux images :

![comparaison_finale](https://makina-corpus.com/blog/metier/2019/redressement-dimage-comparaison-finale)
_Module de comparaison avec l'image redressée à droite._

Le redressement d'images nous ouvre alors la porte vers de nombreuses applications : comparaison superposée, détection de changements automatique... Si l'une d'entre elles vous inspire ou si vous souhaitez de l'aide pour analyser et valoriser vos images, n'hésitez pas à <a href="mailto:contact@autonomens.com" class="btn">nous contacter</a> !