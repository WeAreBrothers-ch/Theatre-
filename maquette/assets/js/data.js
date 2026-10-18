/* Saison 26–27 du Théâtre Benno Besson.
   Contenus repris du site actuel (theatrebennobesson.ch, relevé du 18.10.2026).
   Les heures non publiées sur le site actuel sont indicatives : 20h en semaine, 17h le dimanche,
   12h15 pour le Midi théâtre. Elles sont signalées par `heureIndicative: true`.
   `encre` = couleur dominante du visuel existant de chaque spectacle (prélevée automatiquement). */

window.TBB = window.TBB || {};

TBB.aujourdhui = '2026-10-18';

TBB.genres = ['Théâtre', 'Danse', 'Humour', 'Musique', 'Jeune public'];

TBB.lieux = {
  'Grande Salle': 'Théâtre Benno Besson, Grande Salle (460 places)',
  'Salle 1': 'Théâtre Benno Besson, Salle 1 au 1er étage',
  'Temple': 'Temple d’Yverdon-les-Bains',
  'Église St-Pierre': 'Église catholique St-Pierre, Yverdon-les-Bains',
  'Aula Magna': 'Aula Magna, Yverdon-les-Bains',
  'La Marive': 'La Marive, Yverdon-les-Bains'
};

TBB.tarifs = [
  { nom: 'Plein tarif', prix: 40 },
  { nom: 'Tarif réduit', prix: 35 },
  { nom: 'Moins de 26 ans', prix: 25 },
  { nom: 'Moins de 16 ans', prix: 15 }
];

TBB.spectacles = [
  {
    slug: 'choices', titre: 'Choices', sousTitre: 'précédé de PLEASE, WASH Mii BRAIN',
    par: 'Clément Bugnon & Matthias Kass / company Idem (Cie en résidence) et Ambre Michel-Picque',
    genre: 'Danse', precision: 'Danse (CH)', tags: ['Création', 'Coproduction'],
    dates: [['2026-10-29', '20:00'], ['2026-10-30', '20:00']], lieu: 'Grande Salle', age: 'Tout public, dès 10 ans',
    duree: '1h10 avec entracte', encre: '#e5452f', img: 'assets/img/choices/n/choices-portrait.jpg', vignette: 'assets/img/shows/n/choices.jpg',
    accroche: 'Et si, le temps d’un spectacle, on pouvait changer d’avis ? Le public choisit, les danseurs obéissent.',
    note: 'Effets stroboscopiques dans la première partie',
    texte: [
      'En 2019, le professeur de philosophie Thomas Schauder paraphrase la célèbre citation de Gide : « Choisir, c’était renoncer pour toujours. » Partant de là : « Choisir, c’est nécessairement prendre un chemin à l’exclusion de tous les autres. » Et si justement, le temps d’un spectacle, on pouvait changer d’avis, réviser son choix.',
      'Choices est une pièce intense et ludique qui ouvre une réflexion sur la morale au quotidien, le pouvoir de la tentation et l’art de choisir. Trois interprètes, un maître de cérémonie et un public. Librement inspiré de Faust, de Goethe, le nouveau spectacle participatif de la company Idem offre au public la possibilité de faire des choix et d’en expérimenter en direct les répercussions.',
      'En première partie, la jeune danseuse Ambre Michel-Picque, fraîchement issue de La Manufacture, présente PLEASE, WASH Mii BRAIN, un solo endiablé dans lequel elle s’immerge dans un jeu vidéo et avance au gré de ses choix.'
    ]
  },
  {
    slug: 'diakoff', titre: 'Chœur Diakoff', sousTitre: '',
    par: 'Ensemble vocal a cappella, dir. Alexandre Diakoff',
    genre: 'Musique', precision: 'Musique sacrée orthodoxe', tags: [],
    dates: [['2026-11-01', '17:00']], heureIndicative: true, lieu: 'Église St-Pierre', age: 'Tout public',
    encre: '#827eb9', img: 'assets/img/shows/n/diakoff.jpg',
    accroche: 'Une Toussaint en litanies, hymnes et psaumes : Tchaïkovski, Rimski-Korsakov, Rachmaninov.',
    texte: ['Vivez une célébration de la Toussaint différemment en compagnie du Chœur Diakoff et vibrez au son des litanies, des prières, des hymnes, des chants de louange et des psaumes. Œuvres de Tchaïkovski, Rimski-Korsakov, Arkhangelsky, Rachmaninov et Diakoff.']
  },
  {
    slug: 'kremlin', titre: 'Je n’ai jamais vu le Kremlin', sousTitre: 'd’après « Moscou-Petouchki » de Venedikt Erofeïev',
    par: 'Yan Walther / Le Théâtre de la Recherche',
    genre: 'Théâtre', precision: 'Théâtre (CH)', tags: [],
    dates: [['2026-11-05', '20:00']], heureIndicative: true, lieu: 'Grande Salle', age: 'Dès 14 ans',
    encre: '#15b08a', img: 'assets/img/shows/n/kremlin.jpg', autour: 'Librairie éphémère Payot le soir du spectacle',
    accroche: 'La littérature dissidente soviétique comme porte d’entrée pour regarder la Russie d’aujourd’hui.',
    texte: ['Pour y avoir voyagé, étudié et travaillé, Yan Walther connaît la Russie et l’Ukraine comme sa poche. Depuis le début de l’invasion de l’Ukraine en 2022, passé la consternation, il lui a paru urgent de convoquer la tradition de la littérature dissidente soviétique comme une porte d’entrée pour aborder la Russie d’aujourd’hui.']
  },
  {
    slug: 'tavolo', titre: 'Tavolo Pour Drü', sousTitre: '',
    par: 'Tomoskar Productions',
    genre: 'Théâtre', precision: 'Théâtre (CH)', tags: ['Midi théâtre'],
    dates: [['2026-11-06', '12:15']], heureIndicative: true, lieu: 'Salle 1', age: 'Tout public',
    encre: '#ed5701', img: 'assets/img/shows/n/tavolo.jpg',
    accroche: 'Une appli de rencontre bugue : une Italienne, un Français et un Suisse alémanique à la même table.',
    texte: ['Quand une appli de rencontre bugue et réunit une Italienne, un Français et un Suisse alémanique dans un restaurant, chacun s’attend à un rendez-vous romantique… mais sûrement pas aux deux autres !']
  },
  {
    slug: 'cosimo', titre: 'Cosimo', sousTitre: '',
    par: 'Jean-Yves Ruf / Cie L’Oiseau à Ressort',
    genre: 'Jeune public', precision: 'Théâtre jeune public (CH)', tags: [],
    dates: [['2026-11-11', '17:00']], heureIndicative: true, lieu: 'Grande Salle', age: 'Dès 7 ans',
    encre: '#f8d304', img: 'assets/img/shows/n/cosimo.jpg', distinction: 'Luna Desmeules, lauréate du Prix Tremplin Leenaards / Manufacture 2024',
    accroche: 'Cosimo refuse ses escargots et grimpe dans un arbre. Il n’en redescendra plus.',
    texte: ['Cosimo déteste manger des escargots. Quand son père lui ordonne de finir son assiette, il sort de table et grimpe sur un arbre. Il redescendra quand il aura faim, dit le père.']
  },
  {
    slug: 'reto', titre: 'Un spectacle de droite', sousTitre: 'Le monde selon Reto Zenhäusern',
    par: 'Vincent Kucholl et Vincent Veillon / NASDAQ, Les Productions 360, Opus One',
    genre: 'Humour', precision: 'Humour (CH)', tags: [],
    dates: [['2026-11-15', '18:30'], ['2026-11-16', '20:00']], lieu: 'Grande Salle', age: 'Tout public', statut: 'complet',
    encre: '#2f5fb8', img: 'assets/img/shows/n/reto.jpg',
    accroche: 'Un investisseur sûr de lui donne ses réponses nettes, tranchantes et parfois dérangeantes sur tout.',
    texte: ['Reto Zenhäusern est un investisseur prospère, raisonnablement sûr de lui, et qui aime enseigner le succès autant que le mettre en scène. Qu’il s’agisse de la pauvreté, du travail, de l’industrie du luxe, des inégalités ou de la crise de la démocratie, ses réponses sont nettes, tranchantes, parfois dérangeantes.']
  },
  {
    slug: 'navigator', titre: 'The Navigator', sousTitre: '',
    par: 'Leili Yahr / Compagnie Kaleidos',
    genre: 'Théâtre', precision: 'Théâtre documentaire musical (CH)', tags: ['Coproduction'],
    dates: [['2026-11-21', '20:00']], heureIndicative: true, lieu: 'Grande Salle', age: 'Dès 12 ans',
    encre: '#a5674c', img: 'assets/img/shows/n/navigator.jpg',
    accroche: 'Suissesse irano-américaine, Leili Yahr part cette fois sur les traces de sa part américaine.',
    texte: ['Dans la continuité de l’exploration de ses origines, en tant que Suissesse irano-américaine, Leili Yahr quitte momentanément sa part iranienne, après avoir créé The Glass Room et LES PERSES, spectacles accueillis et coproduits par le TBB en 2022 et 2024.']
  },
  {
    slug: 'prevert', titre: 'L’envol de Prévert', sousTitre: '',
    par: 'De et avec Narcisse, avec la participation d’Eugénie Bachelot-Prévert et de Jean-Philippe Daguerre',
    genre: 'Théâtre', precision: 'Théâtre poétique (CH)', tags: ['Création', 'Coproduction'],
    dates: [['2026-11-27', '20:00']], heureIndicative: true, lieu: 'Grande Salle', age: 'Tout public',
    encre: '#4f9b97', img: 'assets/img/shows/n/prevert.jpg', autour: 'Médiation et librairie éphémère Payot le soir du spectacle',
    accroche: 'Le slameur Narcisse rencontre Jacques Prévert. Entre les deux poètes, une connexion intense.',
    texte: ['Après ses spectacles jubilatoires de slam (Toi tu te tais, HUMAINS), Narcisse renoue avec une des références majeures de la poésie contemporaine : entre Prévert et Narcisse (au-delà du jeu de mots de botanique), c’est certainement une connexion intense qui se noue entre ces deux artistes.']
  },
  {
    slug: 'se-dire-oui', titre: 'Se dire oui', sousTitre: '',
    par: 'Denis Maillefer',
    genre: 'Théâtre', precision: 'Théâtre docu-fiction (CH)', tags: [],
    dates: [['2026-12-05', '20:00']], heureIndicative: true, lieu: 'Grande Salle', age: 'Tout public',
    encre: '#f2a541', img: 'assets/img/shows/n/se-dire-oui.jpg', autour: 'En collaboration avec Ecoute Voir',
    accroche: 'Les invité·es sont là, les fleurs aussi. Le couple, lui, a un peu de retard.',
    texte: ['Les invité·es sont là ; les chaises, disposées ; les fleurs, peut-être déjà en place. On attend le couple sur le point de se dire oui. Mais les deux protagonistes ont un peu de retard. Ça arrive parfois.']
  },
  {
    slug: 'cosmogonia', titre: 'Cosmogonia', sousTitre: '',
    par: 'Human Business',
    genre: 'Théâtre', precision: 'Théâtre et clown (CH)', tags: ['Midi théâtre'],
    dates: [['2026-12-10', '12:15']], heureIndicative: true, lieu: 'Salle 1', age: 'Tout public',
    encre: '#b8166c', img: 'assets/img/shows/n/cosmogonia.jpg',
    accroche: 'Un clown, une navette spatiale et une cireuse à parquet des années 60.',
    texte: ['Dans ce spectacle, on fait la rencontre d’un clown qui interprète COSMOGONIA : l’histoire d’une navette spatiale et de la rencontre de son capitaine avec LA SERVANTE DE FER, une cireuse à parquet des années 60.']
  },
  {
    slug: 'jacqueline', titre: 'Jacqueline', sousTitre: 'de Guillaume Poix',
    par: 'Rébecca Balestra / Manon Krüttli / Guillaume Poix / La FUR compagnie',
    genre: 'Théâtre', precision: 'Théâtre (CH)', tags: [],
    dates: [['2026-12-10', '20:00']], heureIndicative: true, lieu: 'Grande Salle', age: 'Dès 14 ans',
    encre: '#d60638', img: 'assets/img/shows/n/jacqueline.jpg',
    accroche: 'Paris, 1987. Jacqueline Maillan, reine du boulevard, met en scène ses propres adieux.',
    texte: ['Un soir pluvieux de 1987, à Paris. La grande actrice française Jacqueline Maillan décide de se donner la mort. Ne pouvant se résoudre au déclin inexorable de sa carrière, cette reine du boulevard nous convie à ses adieux comme une dernière mise en scène d’elle-même.']
  },
  {
    slug: 'dakhabrakha', titre: 'DakhaBrakha', sousTitre: '',
    par: 'Quatuor de musiques du monde (Kyiv)',
    genre: 'Musique', precision: 'Musiques du monde (UKR)', tags: ['Hors saison'],
    dates: [['2026-12-13', '17:00']], heureIndicative: true, lieu: 'Grande Salle', age: 'Tout public',
    encre: '#7c8f92', img: 'assets/img/shows/n/dakhabrakha.jpg',
    accroche: 'Né au théâtre expérimental « Dakh » de Kyiv, le quatuor est devenu le son d’une Ukraine libre.',
    texte: ['Le quatuor ukrainien de musiques du monde DakhaBrakha, fondé au théâtre expérimental « Dakh » de Kyiv, est devenu le symbole d’une nouvelle Ukraine : libre, audacieuse et indépendante.']
  },
  {
    slug: 'gaetan', titre: 'Gaëtan', sousTitre: 'Pour le meilleur…',
    par: 'Florence Annoni / L’Oreille et Jokers Comedy',
    genre: 'Jeune public', precision: 'Chanson jeune public (CH)', tags: [],
    dates: [['2026-12-19', '17:00']], heureIndicative: true, lieu: 'La Marive', age: 'Dès 4 ans',
    encre: '#c0612f', img: 'assets/img/shows/n/gaetan.jpg',
    accroche: 'Gaëtan remonte sur scène. Rien n’est prêt : ni le groupe, ni les instruments, ni les costumes.',
    texte: ['Gaëtan fait son retour sur scène avec une nouvelle création ! Manque de bol, tout le monde est au courant… sauf lui ! À son arrivée, rien n’est prêt : ni son groupe, ni ses instruments, ni ses costumes et accessoires !']
  },
  {
    slug: 'air-de-famille', titre: 'Un air de famille', sousTitre: 'd’Agnès Jaoui et Jean-Pierre Bacri',
    par: 'Vincent Jaccard / Cercle Littéraire Yverdon',
    genre: 'Théâtre', precision: 'Théâtre (CH)', tags: ['Création'],
    dates: [['2026-12-31', '21:00'], ['2027-01-02', '14:30'], ['2027-01-02', '20:00'], ['2027-01-03', '17:00']], lieu: 'Grande Salle', age: 'Tout public',
    encre: '#efa50f', img: 'assets/img/shows/n/air-de-famille.jpg',
    accroche: 'Vendredi soir au Père tranquille : la famille Mesnard fête l’anniversaire de Yolande.',
    texte: ['Chaque vendredi soir, la famille Mesnard se réunit au Père tranquille, le café tenu par Henri, le fils aîné. Ce soir, on célèbre l’anniversaire de Yolande, l’épouse de Philippe, le fils qui « a réussi ».']
  },
  {
    slug: 'au-diapason', titre: 'Au diapason', sousTitre: '',
    par: 'Cie La Meute',
    genre: 'Jeune public', precision: 'Comédie musicale jeune public (CH)', tags: [],
    dates: [['2027-01-13', '17:00']], heureIndicative: true, lieu: 'Grande Salle', age: 'Dès 8 ans',
    encre: '#6f9f7b', img: 'assets/img/shows/n/au-diapason.jpg',
    accroche: 'Rémi a changé d’école et depuis, tout ce qu’il dit vire à la poésie.',
    texte: ['Depuis qu’il a changé d’école, Rémi a un souci qui lui pourrit la vie. Alors il se rend chez la docteure Edith Moitou, spécialiste de l’expression. En entrant dans le cabinet, il dit : « Je crois que c’est une maladie, tout ce que je dis vire à la poésie ! »']
  },
  {
    slug: 'run-baby-run', titre: 'Run Baby Run', sousTitre: '',
    par: 'Delgado Fuchs',
    genre: 'Danse', precision: 'Danse (CH)', tags: [],
    dates: [['2027-01-21', '20:00']], heureIndicative: true, lieu: 'Grande Salle', age: 'Tout public',
    encre: '#d25c6f', img: 'assets/img/shows/n/run-baby-run.jpg',
    accroche: 'Trois interprètes, trois générations d’une même famille : héritage, pouvoir et transmission.',
    texte: ['RUN BABY RUN est une pièce chorégraphique réunissant trois interprètes de générations différentes au sein d’une même famille. À travers le mouvement, elle explore les dynamiques d’héritage, de pouvoir et de transmission.']
  },
  {
    slug: 'swiss-maker', titre: 'Swiss Maker', sousTitre: '',
    par: 'Cie Le Préfixe',
    genre: 'Théâtre', precision: 'Théâtre (CH)', tags: ['Midi théâtre', 'Afterwork 18h'],
    dates: [['2027-01-26', '12:15'], ['2027-01-26', '18:00']], heureIndicative: true, lieu: 'Salle 1', age: 'Tout public',
    encre: '#17788a', img: 'assets/img/shows/n/swiss-maker.jpg',
    accroche: 'Deux inspecteurs du DINDON font passer au public un test express de naturalisation.',
    texte: ['Dans Swiss Maker, deux inspecteurs du DINDON sillonnent la Suisse pour faire passer aux spectateurs un test express de naturalisation. Nouvelle représentation sous forme d’afterwork à 18h.']
  },
  {
    slug: 'nova-jazz', titre: 'Festival Nova Jazz', sousTitre: 'Échos d’Ukraine',
    par: 'LELÉKA + HEMU Jazz Orchestra featuring DZ’OB',
    genre: 'Musique', precision: 'Jazz (UKR / CH)', tags: [],
    dates: [['2027-01-30', '19:30']], lieu: 'Grande Salle', age: 'Tout public',
    encre: '#4c5895', img: 'assets/img/shows/n/nova-jazz.jpg',
    accroche: 'Le quatuor berlinois LELÉKA et la voix de Viktoria en tête d’affiche du festival.',
    texte: ['Fondé en 2016, LELÉKA est un jeune quatuor multiculturel basé à Berlin, articulé autour de la chanteuse ukrainienne Viktoria, dont la voix définit le caractère et l’atmosphère de leur musique. Avec l’HEMU Jazz Orchestra featuring DZ’OB.']
  },
  {
    slug: 'tango', titre: 'Tango', sousTitre: '(prononcé « TANGO ! »)',
    par: 'Cie Minute Papillon',
    genre: 'Théâtre', precision: 'Théâtre et danse (CH)', tags: ['Midi théâtre'],
    dates: [['2027-02-02', '12:15'], ['2027-02-04', '12:15'], ['2027-02-05', '12:15']], heureIndicative: true, lieu: 'Salle 1', age: 'Tout public',
    encre: '#cc061b', img: 'assets/img/shows/n/tango.jpg',
    accroche: 'Un spectacle hybride théâtre-danse, drôle et engagé, né d’une idée de Diana.',
    texte: ['Tango (prononcé « TANGO ! »), un spectacle hybride théâtre-danse, drôle et engagé, est né d’une idée originale de Diana.']
  },
  {
    slug: 'planchette', titre: 'Planchette', sousTitre: '',
    par: 'Simon Romang / Jokers Comedy',
    genre: 'Humour', precision: 'Humour (CH)', tags: [],
    dates: [['2027-02-04', '20:00']], heureIndicative: true, lieu: 'Grande Salle', age: 'Tout public',
    encre: '#7fb526', img: 'assets/img/shows/n/planchette.jpg',
    accroche: 'Après Charrette ! et Poussette, Simon Romang raconte les grands et les petits moments de sa vie.',
    texte: ['Depuis son premier seul en scène, Charrette !, où il racontait ses débuts sur scène, Simon nous partage avec tendresse et humour aussi bien les grands événements de sa vie, comme la naissance de sa fille avec Poussette, que les plus petits.']
  },
  {
    slug: 'manuel', titre: 'Le Manuel de la jeune mariée 1957', sousTitre: '',
    par: 'Virginie Lemoine / Atelier Théâtre Actuel',
    genre: 'Théâtre', precision: 'Théâtre musical (FR)', tags: [],
    dates: [['2027-02-19', '20:00']], heureIndicative: true, lieu: 'Grande Salle', age: 'Tout public',
    encre: '#6a55a6', img: 'assets/img/shows/n/manuel.jpg', autour: 'Librairie éphémère Payot le soir du spectacle',
    accroche: 'Les guides de bonnes convenances offerts aux mariées de 1957, relus aujourd’hui.',
    texte: ['1957… voilà plus de 70 ans, c’est à peu près l’année où nos mères et nos grands-mères se sont mariées et se sont vu offrir, pour l’occasion, des guides de bonnes convenances censés les muer en épouses et en ménagères exemplaires.']
  },
  {
    slug: 'fratres', titre: 'Ensemble Fratres', sousTitre: 'Dmitry Smirnov, Les Quatre Saisons',
    par: 'Direction Nicolas Penel, soliste Dmitry Smirnov',
    genre: 'Musique', precision: 'Saison musicale classique', tags: [],
    dates: [['2027-02-21', '17:00']], heureIndicative: true, lieu: 'Temple', age: 'Tout public',
    encre: '#cd3c77', img: 'assets/img/shows/n/fratres.jpg',
    accroche: 'Vivaldi sur instruments historiques, par un ensemble né dans l’Arc lémanique.',
    texte: ['Fondé dans l’Arc lémanique en 2010 autour de Nicolas Penel, l’Ensemble Fratres réunit des musiciens passionnés autant par la musique que par les instruments historiques qui l’ont interprétée.']
  },
  {
    slug: 'yann-marguet', titre: 'Yann Marguet', sousTitre: 'Nouveau spectacle',
    par: 'Opus One, en collaboration avec L’Echandole',
    genre: 'Humour', precision: 'Humour (CH)', tags: [],
    dates: [['2027-02-26', '20:00'], ['2027-02-27', '20:00'], ['2027-02-28', '17:00'], ['2027-03-01', '20:00']], lieu: 'Grande Salle', age: 'Tout public', statut: 'attente',
    encre: '#5e6a74', img: 'assets/img/shows/n/yann-marguet.jpg',
    accroche: 'Une enquête tendre et féroce sur ce qui nous constitue.',
    texte: ['L’identité, c’est l’histoire qu’on se raconte sur soi-même pour tenir debout. Yann Marguet a décidé de vérifier si elle tient la route. Son nouveau spectacle est une enquête tendre et féroce sur ce qui nous constitue.']
  },
  {
    slug: 'fresard-cattin', titre: 'Lionel Frésard rencontre Royale Cattin', sousTitre: '(ou l’inverse)',
    par: 'Cie Extrapol',
    genre: 'Théâtre', precision: 'Théâtre (CH)', tags: ['Midi théâtre', 'Afterwork 18h'],
    dates: [['2027-03-05', '12:15'], ['2027-03-05', '18:00']], heureIndicative: true, lieu: 'Salle 1', age: 'Tout public',
    encre: '#b14746', img: 'assets/img/shows/n/fresard-cattin.jpg',
    accroche: 'Deux acteurs du Jura. Dont un est aussi une drag queen. Bref, une rencontre.',
    texte: ['Deux acteurs du Jura. Dont un est aussi une drag queen. Ou plutôt. Une drag queen et un acteur, du Jura. Bref, une rencontre. Nouvelle représentation sous forme d’afterwork à 18h.']
  },
  {
    slug: 'henry-iv', titre: 'Henry IV', sousTitre: 'de Shakespeare',
    par: 'Eric Devanthéry / Cie Utopia',
    genre: 'Théâtre', precision: 'Théâtre (CH)', tags: ['Coproduction'],
    dates: [['2027-03-06', '19:00'], ['2027-03-07', '17:00']], lieu: 'Grande Salle', age: 'Dès 14 ans',
    encre: '#34479a', img: 'assets/img/shows/n/henry-iv.jpg', autour: 'Librairie éphémère Payot le samedi uniquement',
    accroche: 'Une Angleterre agitée par les rébellions, un roi à la légitimité fragile.',
    texte: ['Dans une Angleterre agitée par les rébellions et les rivalités pour le pouvoir, le roi Henri IV doit affermir une légitimité fragile, contestée par de puissants nobles.']
  },
  {
    slug: 'chaplin', titre: 'Chaplin My Father', sousTitre: '',
    par: 'Jean-Philippe Daguerre / Once Upon a Time / Chassot Productions / ABF Swiss Agency',
    genre: 'Théâtre', precision: 'Théâtre (CH)', tags: ['Création', 'Coproduction'],
    dates: [['2027-03-17', '20:00'], ['2027-03-18', '20:00']], heureIndicative: true, lieu: 'Grande Salle', age: 'Tout public',
    encre: '#9a6233', img: 'assets/img/shows/n/chaplin.jpg', autour: 'Bord de scène avec Eugene Chaplin',
    accroche: 'Les vingt-cinq dernières années de Charlie Chaplin, au Manoir de Ban, à Vevey.',
    texte: ['Vevey fut la dernière demeure de Charlie Chaplin. C’est au bord du Léman, au Manoir de Ban, qu’il vécut les vingt-cinq dernières années de sa vie.']
  },
  {
    slug: 'akmi', titre: 'Akmi Duo', sousTitre: 'Sirènes',
    par: 'Valentine Michaud et Akvilė Šileikaitė',
    genre: 'Musique', precision: 'Saison musicale classique', tags: [],
    dates: [['2027-03-21', '17:00']], heureIndicative: true, lieu: 'Aula Magna', age: 'Tout public',
    encre: '#3d93a8', img: 'assets/img/shows/n/akmi.jpg',
    accroche: 'Une ode fougueuse aux figures féminines redoutées, adorées ou haïes des contes et des mythes.',
    texte: ['Sirènes est un récital sous forme de chant, une ode fougueuse à la féminité débridée, à tous ces personnages féminins redoutés, adorés ou haïs dans nos contes, notre littérature et nos mythologies.']
  },
  {
    slug: 'body-electric', titre: 'Body Electric', sousTitre: '',
    par: 'Kiyan Khoshoie / Cie KardiaK',
    genre: 'Danse', precision: 'Danse (CH)', tags: ['Coproduction'],
    dates: [['2027-03-24', '20:00']], heureIndicative: true, lieu: 'Grande Salle', age: 'Tout public',
    encre: '#7a3aa0', img: 'assets/img/shows/n/body-electric.jpg',
    accroche: 'Une célébration douce, joyeuse et puissante de ce qui nous donne envie de bouger.',
    texte: ['Body Electric est une célébration douce, joyeuse et puissante. Une (re)découverte de ce qui éveille en nous le désir de bouger.']
  },
  {
    slug: 'art', titre: 'Art', sousTitre: 'de Yasmina Reza',
    par: 'François Morel',
    genre: 'Théâtre', precision: 'Théâtre (FR)', tags: [],
    dates: [['2027-04-13', '20:00'], ['2027-04-14', '20:00']], heureIndicative: true, lieu: 'Grande Salle', age: 'Tout public',
    encre: '#e89438', img: 'assets/img/shows/n/art.jpg', autour: 'Librairie éphémère Payot les deux soirs',
    accroche: 'Un tableau blanc, entièrement blanc. Et trois amis : Marc, Serge et Yvan.',
    texte: ['Il y aurait un tableau blanc, avec des liserés blancs. Un tableau blanc, entièrement blanc. Une toile aussi blanche qu’une page vide. Puis il y aurait trois amis : Marc, Serge et Yvan.']
  },
  {
    slug: 'alard', titre: 'Benjamin Alard', sousTitre: 'Trios de Jean-Sébastien Bach',
    par: 'Avec Christian Delafontaine et Denitsa Kazakova',
    genre: 'Musique', precision: 'Saison musicale classique', tags: [],
    dates: [['2027-04-18', '17:00']], heureIndicative: true, lieu: 'Temple', age: 'Tout public',
    encre: '#699325', img: 'assets/img/shows/n/alard.jpg',
    accroche: 'Un concert inédit autour des trios de Bach, au Temple d’Yverdon-les-Bains.',
    texte: ['Après avoir accueilli Benjamin Alard en duo avec le flûtiste Emmanuel Pahud lors de la Saison musicale classique 2022-2023, c’est à un concert inédit que nous vous convions, au Temple d’Yverdon-les-Bains.']
  },
  {
    slug: 'komodo', titre: 'Comment l’oncle de maman s’est fait manger par un dragon de Komodo', sousTitre: '',
    par: 'Les FRANGiiNES',
    genre: 'Théâtre', precision: 'Théâtre (CH)', tags: ['Midi théâtre'],
    dates: [['2027-04-20', '12:15']], heureIndicative: true, lieu: 'Salle 1', age: 'Tout public',
    encre: '#438884', img: 'assets/img/shows/n/komodo.jpg',
    accroche: 'Vous avez été sélectionné·es pour un voyage organisé sur l’île de Komodo.',
    texte: ['Vous avez été sélectionné·e·x·s pour faire partie d’un voyage organisé sur l’île de Komodo en Indonésie.']
  },
  {
    slug: 'annette', titre: 'Annette', sousTitre: '',
    par: 'Clémentine Colpin / Compagnie Canicule',
    genre: 'Théâtre', precision: 'Théâtre docu-fiction (BE)', tags: [],
    dates: [['2027-04-22', '20:00']], heureIndicative: true, lieu: 'Grande Salle', age: 'Dès 12 ans',
    encre: '#d98a6a', img: 'assets/img/shows/n/annette.jpg', distinction: 'Prix des lycéens et prix SACD, Festival Impatience 2024',
    accroche: 'Annette a 74 ans. Son récit change le regard d’une metteuse en scène sur la vieillesse.',
    texte: ['Lorsque la metteuse en scène Clémentine Colpin rencontre Annette, 74 ans, elle ne se doute pas que le récit d’une vie, de cette vie-là, va complètement chambouler le regard qu’elle porte sur la vieillesse.']
  },
  {
    slug: 'deluge', titre: 'Déluge', sousTitre: '',
    par: 'Juliette Vernerey / Compagnie de L’Impolie',
    genre: 'Théâtre', precision: 'Théâtre (CH)', tags: ['Création', 'Coproduction'],
    dates: [['2027-04-28', '20:00'], ['2027-04-29', '20:00']], heureIndicative: true, lieu: 'Grande Salle', age: 'Dès 14 ans',
    encre: '#2a57b0', img: 'assets/img/shows/n/deluge.jpg', distinction: 'Lauréat Label+ romand, arts de la scène 2025',
    accroche: 'La famille comme terrain d’expérimentation, entre fiction, autofiction et mémoire.',
    texte: ['Déluge transforme le système familial en terrain d’expérimentation, où fiction et autofiction s’entrelacent, où la mémoire côtoie l’imaginaire.']
  },
  {
    slug: 'cendrillon', titre: 'Cendrillon', sousTitre: '',
    par: 'Georges Grbic / Cie Champs d’action, texte de Mali Van Valenberg',
    genre: 'Jeune public', precision: 'Théâtre jeune public (CH)', tags: ['Création', 'Coproduction'],
    dates: [['2027-05-12', '17:00']], heureIndicative: true, lieu: 'Grande Salle', age: 'Dès 8 ans',
    encre: '#dfae13', img: 'assets/img/shows/n/cendrillon.jpg', autour: 'Librairie éphémère Payot le soir du spectacle',
    accroche: 'Courses poursuites, colère du père : un conte revisité qui s’inscrit dans la vraie vie.',
    texte: ['Courses poursuites, colère du père, cette version du conte de Cendrillon, revisité par l’autrice Mali Van Valenberg, s’inscrit dans la réalité de la vie.']
  },
  {
    slug: 'manekine', titre: 'La Manékine', sousTitre: '',
    par: 'Estelle Charlier & Romuald Collinet / Compagnie La Pendue',
    genre: 'Jeune public', precision: 'Marionnettes et musiques (FR)', tags: [],
    dates: [['2027-05-29', '17:00']], heureIndicative: true, lieu: 'Grande Salle', age: 'Dès 9 ans',
    encre: '#97639f', img: 'assets/img/shows/n/manekine.jpg', autour: 'Librairie éphémère Payot le soir du spectacle',
    accroche: 'Le conte de la Jeune Fille sans mains, en marionnettes : une initiation lumineuse et sanglante.',
    texte: ['Conte médiéval intitulé « La Jeune Fille sans mains », notamment récolté par les frères Grimm, La Manékine présente une initiation féminine lumineuse et sanglante qui n’a nullement perdu de son actualité.']
  }
];

/* Fiche complète de Choices (spectacle mis en avant dans la maquette). */
TBB.fiches = {
  choices: {
    galerie: [
      { src: 'assets/img/choices/choices-1.jpg', legende: 'Choices, company Idem', credit: 'Jeanette Bak Huber' },
      { src: 'assets/img/choices/choices-4.jpg', legende: 'Choices', credit: 'Jeanette Bak Huber' },
      { src: 'assets/img/choices/choices-2.jpg', legende: 'Choices', credit: 'Jeanette Bak Huber' },
      { src: 'assets/img/choices/choices-3.jpg', legende: 'PLEASE, WASH Mii BRAIN', credit: 'Raphaël Harari' },
      { src: 'assets/img/choices/choices-5.jpg', legende: 'PLEASE, WASH Mii BRAIN', credit: 'Raphaël Harari' }
    ],
    duree: [['Première partie', '20 min'], ['Entracte', '20 min'], ['Pièce principale', '30 min']],
    distribution: [
      { titre: 'Choices', lignes: [
        ['Chorégraphes', 'Clément Bugnon et Matthias Kass'], ['Regard extérieur', 'Georges Grbic'], ['Danseuse', 'Rosalia Pace'],
        ['Danseurs', 'Manolo Perazzi, Stefano Roveda'], ['Maître de cérémonie', 'Clément Bugnon'], ['Coach jeu d’acteur·ice', 'Marylène Rouiller'],
        ['Production', 'company Idem'], ['Coproduction', 'Théâtre Benno Besson & Kulturbüro Friedrichshafen (DE)'],
        ['Partenaires', 'Phönix Theater, Steckborn & LeZartiCirque, Sainte-Croix'], ['Photos', 'Jeanette Bak Huber']
      ] },
      { titre: 'PLEASE, WASH Mii BRAIN', lignes: [
        ['Performeuse, chorégraphe', 'Ambre Michel-Picque'], ['Création son', 'Ian Lecoultre'], ['Création lumière', 'Amon Mantel'],
        ['Technicien', 'Clovis Marchon'], ['Regard extérieur', 'Sarah-Marie Benninghoff, Cie Entre mots et mouvements'], ['Photos', 'Raphaël Harari']
      ] }
    ],
    soutiens: 'Convention 2025-2028 des Villes d’Yverdon-les-Bains et de Sainte-Croix, Fondation CEPY, Fondation Corymbo, Fondation Casino Barrière Montreux, Loterie Romande.',
    creation: 'Création le 29 octobre 2026 au Théâtre Benno Besson.'
  }
};

/* Visuels sombres : imprimés « en blanc » sur l'encre (fusion screen) plutôt qu'en noir (multiply). */
TBB.fondsSombres = ["alard", "au-diapason", "cendrillon", "chaplin", "choices", "cosimo", "cosmogonia", "dakhabrakha", "deluge", "diakoff", "gaetan", "henry-iv", "jacqueline", "kremlin", "manekine", "run-baby-run", "tango", "yann-marguet"];
