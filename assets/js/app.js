/* Théâtre Benno Besson — interactions de la maquette (sans dépendance). */
(function () {
  'use strict';
  var T = window.TBB;
  var JOURS = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];
  var JOURS_LONGS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

  /* ---------- Outils ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // Typographie française : espace fine insécable avant : ; ! ? » et après «
  function typo(s) { return String(s || '').replace(/ ([:;!?»])/g, ' $1').replace(/« /g, '« '); }
  function t(s) { return esc(typo(s)); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function jour(iso) { var p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function heure(hhmm) { var p = hhmm.split(':'); return p[1] === '00' ? (+p[0]) + 'h' : (+p[0]) + 'h' + p[1]; }
  function dateCourte(iso) { var d = jour(iso); return pad(d.getDate()) + '.' + pad(d.getMonth() + 1); }
  function jourCourt(iso) { return JOURS[jour(iso).getDay()]; }
  function quantieme(d) { return d.getDate() === 1 ? '1er' : String(d.getDate()); }
  function dateLongue(iso) { var d = jour(iso); return JOURS_LONGS[d.getDay()] + ' ' + quantieme(d) + ' ' + MOIS[d.getMonth()]; }
  function longueur(titre) { var n = titre.length; return n > 34 ? 'tres-long' : n > 16 ? 'long' : n > 9 ? 'court' : 'tres-court'; }
  function stocker(cle, val) { try { localStorage.setItem('tbb:' + cle, val); } catch (e) { /* stockage indisponible */ } }
  function lire(cle) { try { return localStorage.getItem('tbb:' + cle); } catch (e) { return null; } }

  /* ---------- Encres ---------- */
  function rgb(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function hex(c) { return '#' + c.map(function (v) { return pad2(Math.round(v).toString(16)); }).join(''); }
  function pad2(s) { return s.length < 2 ? '0' + s : s; }
  function luminance(h) {
    var c = rgb(h).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function melanger(a, b, p) { var x = rgb(a), y = rgb(b); return hex(x.map(function (v, i) { return v + (y[i] - v) * p; })); }
  function encre(s) {
    var L = luminance(s.encre);
    return { ink: s.encre, img: L < 0.12 ? melanger(s.encre, '#ffffff', 0.4) : s.encre, texte: L > 0.179 ? '#0d0d0c' : '#ffffff' };
  }
  function styleEncre(s) { var e = encre(s); return '--ink:' + e.ink + ';--ink-img:' + e.img + ';--ink-texte:' + e.texte; }
  function appliquerEncre(el, s) { var e = encre(s); el.style.setProperty('--ink', e.ink); el.style.setProperty('--ink-img', e.img); el.style.setProperty('--ink-texte', e.texte); }

  /* ---------- Données dérivées ---------- */
  var spectacles = T.spectacles.slice().sort(function (a, b) { return (a.dates[0][0] + a.dates[0][1]).localeCompare(b.dates[0][0] + b.dates[0][1]); });
  function parSlug(slug) { for (var i = 0; i < spectacles.length; i++) if (spectacles[i].slug === slug) return spectacles[i]; return null; }
  function datesAVenir(s) { return s.dates.filter(function (d) { return d[0] >= T.aujourdhui; }); }
  function aVenir() { return spectacles.filter(function (s) { return datesAVenir(s).length; }); }
  function premiere(s) { var d = datesAVenir(s); return d.length ? d[0] : s.dates[0]; }
  function lien(s) { return 'spectacle.html#' + s.slug; }
  function fond(s) { return (T.fondsSombres || []).indexOf(s.slug) >= 0 ? 'sombre' : 'clair'; }
  function lieuCourt(s) { return s.lieu; }
  function joursDistincts(s) { var vus = {}; return s.dates.filter(function (d) { if (vus[d[0]]) return false; vus[d[0]] = 1; return true; }); }
  function resumeDates(s, long) {
    var ds = joursDistincts(s);
    if (long) {
      if (ds.length === 1) return dateLongue(ds[0][0]);
      if (ds.length === 2) {
        var a = jour(ds[0][0]), b = jour(ds[1][0]);
        if (a.getMonth() === b.getMonth()) return JOURS[a.getDay()] + ' ' + quantieme(a) + ' + ' + JOURS[b.getDay()] + ' ' + quantieme(b) + ' ' + MOIS[b.getMonth()];
        return dateLongue(ds[0][0]) + ' + ' + dateLongue(ds[1][0]);
      }
      return 'Du ' + dateLongue(ds[0][0]) + ' au ' + dateLongue(ds[ds.length - 1][0]);
    }
    if (ds.length === 1) return jourCourt(ds[0][0]) + ' ' + dateCourte(ds[0][0]);
    if (ds.length === 2) return jourCourt(ds[0][0]) + ' ' + dateCourte(ds[0][0]).slice(0, 2) + ' + ' + jourCourt(ds[1][0]) + ' ' + dateCourte(ds[1][0]);
    return dateCourte(ds[0][0]) + ' → ' + dateCourte(ds[ds.length - 1][0]);
  }
  function heuresResume(s) {
    var hs = []; s.dates.forEach(function (d) { var h = heure(d[1]); if (hs.indexOf(h) < 0) hs.push(h); });
    return hs.join(' / ');
  }

  /* ---------- Gabarits ---------- */
  var BANDEAUX = { complet: ['Complet', 'rouge'], attente: ['Liste d’attente', 'papier'] };
  function bandeau(s) {
    var b = null;
    if (s.statut && BANDEAUX[s.statut]) b = BANDEAUX[s.statut];
    else if (s.tags.indexOf('Création') >= 0) b = ['Création', ''];
    else if (s.tags.indexOf('Afterwork 18h') >= 0) b = ['Afterwork 18h', 'vert'];
    if (!b) return '';
    var txt = t(b[0]);
    return '<span class="bandeau' + (b[1] ? ' bandeau--' + b[1] : '') + '" aria-hidden="true">' + txt + ' · ' + txt + ' · ' + txt + ' · ' + txt + '</span>';
  }

  function affiche(s, opts) {
    opts = opts || {};
    var p = premiere(s);
    var statut = s.statut === 'complet' ? ', complet' : s.statut === 'attente' ? ', liste d’attente' : '';
    return '<a class="affiche' + (opts.grande ? ' affiche--grande' : '') + '" href="' + lien(s) + '" style="' + styleEncre(s) + '"' +
      ' aria-label="' + esc(typo(s.titre + ', ' + resumeDates(s, true) + ', ' + s.genre + statut)) + '">' +
      '<div class="affiche__image" data-fond="' + fond(s) + '"><img src="' + esc(s.vignette || s.img) + '" alt="" loading="lazy" decoding="async"></div>' +
      '<div class="affiche__haut"><span class="etiquette chiffres">' + t(resumeDates(s)) + '</span>' +
      (s.tags.indexOf('Midi théâtre') >= 0 ? '<span class="etiquette etiquette--encre">Midi théâtre</span>' : '<span class="etiquette etiquette--encre">' + t(s.genre) + '</span>') + '</div>' +
      bandeau(s) +
      '<div class="affiche__bas">' +
        '<h3 class="affiche__titre t-affiche" data-longueur="' + longueur(s.titre) + '">' + t(s.titre) + '</h3>' +
        '<p class="affiche__par">' + t(s.par.split(' / ')[0]) + '</p>' +
        '<p class="affiche__infos"><span>' + t(lieuCourt(s)) + '</span><span>' + t(heure(p[1])) + '</span></p>' +
      '</div></a>';
  }

  function etatReservation(s) {
    if (s.statut === 'complet') return '<span class="statut">Complet</span>';
    if (s.statut === 'attente') return '<span class="statut statut--attente">Liste d’attente</span>';
    return '<span class="btn btn--trait btn--petit">Réserver <span class="fleche" aria-hidden="true">→</span></span>';
  }

  function ligne(s) {
    var p = premiere(s), ds = joursDistincts(s).filter(function (d) { return d[0] >= T.aujourdhui; });
    var autres = ds.length > 1 ? (ds.length === 2 ? 'et ' + jourCourt(ds[1][0]).toLowerCase() + ' ' + dateCourte(ds[1][0]) : '+ ' + (ds.length - 1) + ' dates') : '';
    var tags = s.tags.filter(function (x) { return x !== 'Afterwork 18h'; });
    return '<a class="agenda__ligne" href="' + lien(s) + '" style="' + styleEncre(s) + '">' +
      '<div class="agenda__date"><span class="agenda__jour">' + esc(jourCourt(p[0])) + (autres ? ' <span class="visuellement-cache">' + esc(autres) + '</span>' : '') + '</span>' +
        '<span class="agenda__num">' + esc(dateCourte(p[0])) + '</span>' +
        (autres ? '<span class="agenda__jour" aria-hidden="true">' + esc(autres) + '</span>' : '') + '</div>' +
      '<div class="agenda__infos"><span class="agenda__heure">' + esc(heuresResume(s)) + '</span><br class="seulement-large"><span class="agenda__lieu">' + t(s.lieu) + '</span></div>' +
      '<div class="agenda__principal"><h3 class="agenda__titre t-affiche">' + t(s.titre) + '</h3>' +
        '<p class="agenda__par">' + t((s.sousTitre ? s.sousTitre + ' · ' : '') + s.par) + '</p>' +
        (tags.length || s.autour ? '<div class="agenda__tags">' + tags.map(function (x) { return '<span class="etiquette etiquette--encre">' + t(x) + '</span>'; }).join('') + '</div>' : '') +
      '</div>' +
      '<div class="agenda__genre">' + t(s.genre) + '<br><span class="agenda__lieu">' + t(s.age) + '</span></div>' +
      '<div class="agenda__action">' + etatReservation(s) + '</div>' +
      '<div class="agenda__vignette" data-fond="' + fond(s) + '" aria-hidden="true"><img src="' + esc(s.vignette || s.img) + '" alt="" loading="lazy"></div>' +
    '</a>';
  }

  /* ---------- Menu mobile ---------- */
  function initMenu() {
    var btn = $('.btn-menu'), menu = $('#menu-mobile');
    if (!btn || !menu) return;
    var fermer = $('.menu-mobile__fermer', menu);
    function ouvrir() { menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; (fermer || menu).focus(); }
    function clore() { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; btn.focus(); }
    btn.addEventListener('click', ouvrir);
    if (fermer) fermer.addEventListener('click', clore);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) clore(); });
  }

  /* ---------- Lettre d'information ---------- */
  function initLettre() {
    $$('form[data-lettre]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var champ = $('input[type="email"]', f), msg = $('.message-ok', f);
        if (!champ.value || !champ.checkValidity()) { champ.focus(); msg.textContent = 'Indiquez une adresse e-mail valide, par exemple prenom@exemple.ch.'; msg.hidden = false; return; }
        msg.textContent = typo('Inscription enregistrée. Prochaine lettre : début novembre.');
        msg.hidden = false; champ.value = '';
      });
    });
  }

  /* ---------- Bandeau du jour ---------- */
  function initJour() {
    var el = $('#jour-texte'); if (!el) return;
    var ceSoir = spectacles.filter(function (s) { return s.dates.some(function (d) { return d[0] === T.aujourdhui; }); });
    var auj = dateLongue(T.aujourdhui);
    if (ceSoir.length) {
      var s = ceSoir[0], d = s.dates.filter(function (x) { return x[0] === T.aujourdhui; })[0];
      el.innerHTML = '<span class="jour__pastille" aria-hidden="true"></span>' + t('Aujourd’hui, ' + auj + ' : ') + '<a href="' + lien(s) + '">' + t(s.titre) + ' à ' + heure(d[1]) + '</a>';
    } else {
      var n = aVenir()[0], p = premiere(n);
      el.innerHTML = '<span class="jour__pastille" aria-hidden="true"></span>' + t('Aujourd’hui, ' + auj + ', relâche. Prochain lever de rideau : ') + '<a href="' + lien(n) + '">' + t(n.titre) + ', ' + dateLongue(p[0]) + ' à ' + heure(p[1]) + '</a>';
    }
  }

  /* ---------- Accueil : À l'affiche ---------- */
  function initUne() {
    var racine = $('#une'); if (!racine) return;
    var liste = aVenir().filter(function (s) { return !s.statut; }).slice(0, 3);
    var i = 0;
    var visuel = $('.une__visuel', racine), contenu = $('.une__contenu', racine), compteur = $('.une__compteur', racine);
    function rendre(anim) {
      var s = liste[i], p = premiere(s);
      appliquerEncre(racine, s);
      var img = s.img;
      visuel.innerHTML = '<a class="affiche affiche--grande trame" href="' + lien(s) + '" style="' + styleEncre(s) + '" tabindex="-1" aria-hidden="true">' +
        '<div class="affiche__image" data-fond="' + fond(s) + '"><img src="' + esc(img) + '" alt=""' + (i === 0 ? ' fetchpriority="high"' : '') + '></div>' + bandeau(s) +
        '</a>';
      var meta = [s.lieu, s.genre, s.age].filter(Boolean).join(' · ');
      contenu.innerHTML =
        '<div><h2 class="une__titre t-affiche" data-longueur="' + longueur(s.titre) + '"><a href="' + lien(s) + '" style="text-decoration:none">' + t(s.titre) + '</a></h2>' +
        (s.sousTitre ? '<p class="une__sous-titre">' + t(s.sousTitre) + '</p>' : '') + '</div>' +
        '<div class="une__bas">' +
          '<div><p class="une__date">' + t(resumeDates(s, true)) + '<br>' + esc(heuresResume(s)) + '</p><p class="une__meta">' + t(meta) + '</p></div>' +
          '<p class="une__accroche">' + t(s.accroche) + '</p>' +
          '<div class="une__actions"><button class="btn btn--plein" type="button" data-reserver="' + esc(s.slug) + '">Réserver <span class="fleche" aria-hidden="true">→</span></button>' +
          '<a class="btn btn--trait" href="' + lien(s) + '">Le spectacle</a></div>' +
        '</div>';
      compteur.textContent = (i + 1) + ' / ' + liste.length;
      if (anim) {
        var titre = $('.une__titre', contenu), vis = $('.affiche', visuel);
        [titre, vis].forEach(function (el) { el.classList.remove('entre'); void el.offsetWidth; el.classList.add('entre'); });
      }
    }
    $('[data-une="prec"]', racine).addEventListener('click', function () { i = (i - 1 + liste.length) % liste.length; rendre(true); });
    $('[data-une="suiv"]', racine).addEventListener('click', function () { i = (i + 1) % liste.length; rendre(true); });
    rendre(true);
  }

  /* ---------- Accueil : agenda, mur, jeune public ---------- */
  function initAgendaAccueil() {
    var el = $('#agenda-accueil'); if (!el) return;
    el.innerHTML = aVenir().slice(0, 7).map(ligne).join('');
  }
  function initMurAccueil() {
    var el = $('#mur-accueil'), filtres = $('#filtres-accueil'); if (!el || !filtres) return;
    var genres = ['Tout'].concat(T.genres);
    filtres.innerHTML = genres.map(function (g, k) { return '<button class="filtre" type="button" aria-pressed="' + (k === 0) + '" data-genre="' + esc(g) + '">' + t(g) + '</button>'; }).join('');
    function rendre(g) {
      var l = aVenir().filter(function (s) { return g === 'Tout' || s.genre === g; }).slice(7, 15);
      if (l.length < 4) l = aVenir().filter(function (s) { return g === 'Tout' || s.genre === g; }).slice(0, 8);
      el.innerHTML = l.map(function (s) { return affiche(s); }).join('');
    }
    filtres.addEventListener('click', function (e) {
      var b = e.target.closest('.filtre'); if (!b) return;
      $$('.filtre', filtres).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      rendre(b.getAttribute('data-genre'));
    });
    rendre('Tout');
  }
  function initJeunePublic() {
    var el = $('#mur-jeune'); if (!el) return;
    el.innerHTML = spectacles.filter(function (s) { return s.genre === 'Jeune public'; }).map(function (s) { return affiche(s); }).join('');
  }

  /* ---------- Programme ---------- */
  function initProgramme() {
    var zone = $('#programme'); if (!zone) return;
    var etat = { vue: lire('vue') === 'affiches' ? 'affiches' : 'liste', genre: 'Tout', mois: 'tous', midi: false, dispo: false, q: '' };
    var h = decodeURIComponent((location.hash || '').slice(1));
    var parHash = { 'jeune-public': 'Jeune public', 'theatre': 'Théâtre', 'danse': 'Danse', 'humour': 'Humour', 'musique': 'Musique' };
    if (parHash[h]) etat.genre = parHash[h];
    if (h === 'midi-theatre') etat.midi = true;

    var fGenres = $('#filtres-genre'), fMois = $('#filtres-mois'), compte = $('#resultats');
    var genres = ['Tout'].concat(T.genres);
    fGenres.innerHTML = genres.map(function (g) {
      var n = g === 'Tout' ? spectacles.length : spectacles.filter(function (s) { return s.genre === g; }).length;
      return '<button class="filtre" type="button" data-genre="' + esc(g) + '" aria-pressed="' + (etat.genre === g) + '">' + t(g) + ' <span class="filtre__nombre">' + n + '</span></button>';
    }).join('') +
      '<button class="filtre" type="button" data-bascule="midi" aria-pressed="' + etat.midi + '">Midi théâtre</button>' +
      '<button class="filtre" type="button" data-bascule="dispo" aria-pressed="false">Places disponibles</button>';

    var moisListe = []; spectacles.forEach(function (s) { var m = s.dates[0][0].slice(0, 7); if (moisListe.indexOf(m) < 0) moisListe.push(m); });
    fMois.innerHTML = '<button type="button" data-mois="tous" aria-pressed="true">Toute la saison</button>' + moisListe.map(function (m) {
      var d = jour(m + '-01'); return '<button type="button" data-mois="' + m + '" aria-pressed="false" aria-label="' + MOIS[d.getMonth()] + ' ' + d.getFullYear() + '">' + MOIS_COURTS[d.getMonth()] + '</button>';
    }).join('');

    function filtrer() {
      var q = etat.q.trim().toLowerCase();
      return spectacles.filter(function (s) {
        if (etat.genre !== 'Tout' && s.genre !== etat.genre) return false;
        if (etat.mois !== 'tous' && s.dates[0][0].slice(0, 7) !== etat.mois) return false;
        if (etat.midi && s.tags.indexOf('Midi théâtre') < 0) return false;
        if (etat.dispo && s.statut) return false;
        if (q && (s.titre + ' ' + s.par + ' ' + s.sousTitre + ' ' + s.precision).toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
    }
    function rendre() {
      var l = filtrer();
      $$('.vue button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-vue') === etat.vue)); });
      compte.textContent = l.length + (l.length > 1 ? ' spectacles' : ' spectacle');
      if (!l.length) {
        zone.innerHTML = '<div class="vide"><p class="t-affiche t-m">Aucun spectacle ne correspond.</p><p>Essayez un autre genre ou un autre mois.</p><button class="btn btn--trait" type="button" data-effacer>Effacer les filtres</button></div>';
        return;
      }
      var groupes = [], cle = null;
      l.forEach(function (s) { var m = s.dates[0][0].slice(0, 7); if (m !== cle) { groupes.push({ m: m, l: [] }); cle = m; } groupes[groupes.length - 1].l.push(s); });
      zone.innerHTML = groupes.map(function (g) {
        var d = jour(g.m + '-01');
        var tete = '<div class="mois"><h2 class="t-affiche t-l">' + esc(MOIS[d.getMonth()]) + ' <span class="mois__nombre t-label">' + d.getFullYear() + '</span></h2><span class="mois__nombre">' + g.l.length + (g.l.length > 1 ? ' spectacles' : ' spectacle') + '</span></div>';
        return '<section aria-label="' + esc(MOIS[d.getMonth()] + ' ' + d.getFullYear()) + '">' + tete + (etat.vue === 'liste' ? '<div class="agenda">' + g.l.map(ligne).join('') + '</div>' : '<div class="mur">' + g.l.map(function (s) { return affiche(s); }).join('') + '</div>') + '</section>';
      }).join('');
    }
    fGenres.addEventListener('click', function (e) {
      var b = e.target.closest('.filtre'); if (!b) return;
      if (b.hasAttribute('data-genre')) {
        etat.genre = b.getAttribute('data-genre');
        $$('[data-genre]', fGenres).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      } else {
        var k = b.getAttribute('data-bascule'); etat[k] = !etat[k]; b.setAttribute('aria-pressed', String(etat[k]));
      }
      rendre();
    });
    fMois.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      etat.mois = b.getAttribute('data-mois');
      $$('button', fMois).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      rendre();
    });
    $$('.vue button').forEach(function (b) { b.addEventListener('click', function () { etat.vue = b.getAttribute('data-vue'); stocker('vue', etat.vue); rendre(); }); });
    $('#recherche').addEventListener('input', function (e) { etat.q = e.target.value; rendre(); });
    zone.addEventListener('click', function (e) {
      if (!e.target.closest('[data-effacer]')) return;
      etat = { vue: etat.vue, genre: 'Tout', mois: 'tous', midi: false, dispo: false, q: '' };
      $('#recherche').value = '';
      $$('[data-genre]', fGenres).forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-genre') === 'Tout')); });
      $$('[data-bascule]', fGenres).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      $$('button', fMois).forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-mois') === 'tous')); });
      rendre();
    });
    rendre();
  }

  /* ---------- Fiche spectacle ---------- */
  function initSpectacle() {
    var racine = $('#fiche'); if (!racine) return;
    function rendre() {
      var slug = (location.hash || '#choices').slice(1);
      var s = parSlug(slug) || parSlug('choices');
      var f = T.fiches[s.slug];
      document.title = typo(s.titre) + ' — Théâtre Benno Besson';
      var tete = $('.fiche-tete'); appliquerEncre(tete, s);
      var ds = datesAVenir(s).length ? datesAVenir(s) : s.dates;
      var infos = [
        ['Dates', resumeDates(s, true)], ['Heure', heuresResume(s) + (s.heureIndicative ? ' (indicatif)' : '')], ['Lieu', T.lieux[s.lieu] || s.lieu],
        ['Genre', s.precision], ['Public', s.age]
      ];
      if (s.duree) infos.push(['Durée', s.duree]);
      infos.push(['Tarifs', s.statut === 'complet' ? 'Complet' : '40.– / 35.– / 25.– (moins de 26 ans) / 15.– (moins de 16 ans)']);
      $('#fiche-ariane').innerHTML = '<a href="index.html">Accueil</a> / <a href="programme.html">Programme 26–27</a> / ' + t(s.genre);
      $('#fiche-titre').innerHTML = '<h1 class="t-affiche" data-longueur="' + longueur(s.titre) + '">' + t(s.titre) + '</h1>' + (s.sousTitre || s.par ? '<p>' + t((s.sousTitre ? s.sousTitre + ' · ' : '') + s.par) + '</p>' : '');
      $('#fiche-visuel').innerHTML = '<div class="imprime trame" data-fond="' + fond(s) + '" style="' + styleEncre(s) + '"><img src="' + esc(s.img) + '" alt="' + esc('Visuel du spectacle ' + s.titre) + '"></div>' + bandeau(s);
      var action = s.statut === 'complet' ? '<p class="alerte">Complet. Des places se libèrent parfois : appelez la billetterie au 024 423 65 84.</p>'
        : s.statut === 'attente' ? '<button class="btn btn--plein" type="button" data-reserver="' + esc(s.slug) + '">S’inscrire sur la liste d’attente</button>'
        : '<div style="display:flex;flex-wrap:wrap;gap:12px"><button class="btn btn--plein" type="button" data-reserver="' + esc(s.slug) + '">Réserver <span class="fleche" aria-hidden="true">→</span></button><a class="btn btn--trait" href="#dates">Toutes les dates</a></div>';
      $('#fiche-infos').innerHTML = '<p class="fiche-tete__accroche">' + t(s.accroche) + '</p>' +
        '<dl class="infos-liste">' + infos.map(function (x) { return '<dt>' + t(x[0]) + '</dt><dd>' + t(x[1]) + '</dd>'; }).join('') + '</dl>' +
        (s.note ? '<p class="alerte"><span aria-hidden="true">⚠</span> ' + t(s.note) + '</p>' : '') + action;

      // Corps
      var texte = s.texte.map(function (p) { return '<p>' + t(p) + '</p>'; }).join('');
      var aside = '';
      if (f && f.duree) aside += '<div class="encart"><h3>Déroulé</h3><ul>' + f.duree.map(function (d) { return '<li>' + t(d[0]) + ' : ' + t(d[1]) + '</li>'; }).join('') + '</ul></div>';
      if (s.autour) aside += '<div class="encart"><h3>Autour du spectacle</h3><p>' + t(s.autour) + '</p></div>';
      if (s.distinction) aside += '<div class="encart"><h3>Distinction</h3><p>' + t(s.distinction) + '</p></div>';
      aside += '<div class="encart"><h3>Accessibilité</h3><p>' + t(s.lieu === 'Grande Salle' ? 'Grande Salle équipée d’une boucle magnétique. Places pour fauteuil roulant à réserver au 024 423 65 84, billet offert à la personne qui accompagne.' : s.lieu === 'Salle 1' ? 'Salle 1 au premier étage, accessible par un monte-personne. Venez un peu en avance ou prévenez la billetterie.' : 'Renseignements sur l’accès au lieu auprès de la billetterie, 024 423 65 84.') + '</p></div>';
      aside += '<div class="encart"><h3>Venir</h3><p>' + t(s.lieu === 'Grande Salle' || s.lieu === 'Salle 1' ? 'Rue du Casino 9, à 3 minutes à pied de la gare. Bus 604 et 605, arrêt Théâtre Benno Besson.' : (T.lieux[s.lieu] || s.lieu) + '.') + '</p><a class="lien-fleche" href="infos.html#venir">Plan et accès <span class="fleche" aria-hidden="true">→</span></a></div>';
      $('#fiche-texte').innerHTML = texte;
      $('#fiche-aside').innerHTML = aside;

      // Représentations
      $('#fiche-dates').innerHTML = s.dates.map(function (d) {
        var passe = d[0] < T.aujourdhui;
        var btn = passe ? '<span class="t-label">Passé</span>' : s.statut === 'complet' ? '<span class="statut">Complet</span>' : s.statut === 'attente' ? '<span class="statut statut--attente">Liste d’attente</span>' : '<button class="btn btn--trait btn--petit" type="button" data-reserver="' + esc(s.slug) + '" data-date="' + esc(d[0] + 'T' + d[1]) + '">Réserver <span class="fleche" aria-hidden="true">→</span></button>';
        return '<div class="representation"><span class="representation__date chiffres">' + esc(jourCourt(d[0]) + ' ' + dateCourte(d[0])) + '</span><span class="chiffres">' + esc(heure(d[1])) + '</span><span class="representation__lieu">' + t(T.lieux[s.lieu] || s.lieu) + '</span>' + btn + '</div>';
      }).join('');

      // Galerie et distribution
      var gal = $('#galerie'), dist = $('#distribution');
      if (f && f.galerie) {
        gal.hidden = false;
        $('.galerie', gal).innerHTML = f.galerie.map(function (g, k) { return '<figure class="g-' + (k + 1) + '"><img src="' + esc(g.src) + '" alt="' + esc(g.legende) + '" loading="lazy"><figcaption>' + t(g.legende) + ' · photo ' + t(g.credit) + '</figcaption></figure>'; }).join('');
      } else gal.hidden = true;
      if (f && f.distribution) {
        dist.hidden = false;
        $('.distribution', dist).innerHTML = f.distribution.map(function (b) { return '<div><h3 class="t-affiche">' + t(b.titre) + '</h3><dl>' + b.lignes.map(function (x) { return '<dt>' + t(x[0]) + '</dt><dd>' + t(x[1]) + '</dd>'; }).join('') + '</dl></div>'; }).join('') +
          '<p style="grid-column:1/-1;font-size:var(--t-petit)">' + t(f.creation + ' Soutiens : ' + f.soutiens) + '</p>';
      } else dist.hidden = true;
      $$('[data-si-fiche]').forEach(function (a) { a.parentNode.hidden = !(f && f[a.getAttribute('data-si-fiche')]); });

      // Dans la même veine
      var proches = aVenir().filter(function (x) { return x.slug !== s.slug && x.genre === s.genre; });
      if (proches.length < 4) proches = proches.concat(aVenir().filter(function (x) { return x.slug !== s.slug && x.genre !== s.genre; }));
      $('#proches').innerHTML = proches.slice(0, 4).map(function (x) { return affiche(x); }).join('');

      // Barre mobile
      var p = premiere(s);
      $('#barre-reserver').innerHTML = '<span><strong>' + t(s.titre) + '</strong><br>' + esc(jourCourt(p[0]) + ' ' + dateCourte(p[0]) + ' · ' + heure(p[1])) + '</span>' +
        (s.statut === 'complet' ? '<span class="statut">Complet</span>' : '<button class="btn btn--clair" type="button" data-reserver="' + esc(s.slug) + '">Réserver</button>');
    }
    window.addEventListener('hashchange', function () { rendre(); window.scrollTo(0, 0); });
    rendre();
  }

  /* ---------- Tiroir de réservation ---------- */
  function initReservation() {
    var dernierFocus = null;
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-reserver]'); if (!b) return;
      e.preventDefault();
      dernierFocus = b;
      ouvrir(parSlug(b.getAttribute('data-reserver')), b.getAttribute('data-date'));
    });
    function fermer() {
      var v = $('.voile'), d = $('.tiroir');
      if (v) v.remove(); if (d) d.remove();
      document.body.style.overflow = '';
      if (dernierFocus) dernierFocus.focus();
    }
    function ouvrir(s, dateChoisie) {
      if (!s) return;
      fermer();
      var ds = datesAVenir(s);
      var q = {}; T.tarifs.forEach(function (x) { q[x.nom] = 0; });
      var voile = document.createElement('div'); voile.className = 'voile';
      var d = document.createElement('aside'); d.className = 'tiroir'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'tiroir-titre');
      d.innerHTML =
        '<div class="tiroir__tete" style="' + styleEncre(s) + '"><button class="tiroir__fermer" type="button" aria-label="Fermer la réservation">✕</button>' +
          '<p class="t-label">Réserver</p><h2 class="tiroir__titre t-affiche" id="tiroir-titre">' + t(s.titre) + '</h2><p>' + t(T.lieux[s.lieu] || s.lieu) + '</p></div>' +
        '<div class="tiroir__corps">' +
          '<fieldset class="choix-date" style="border:0;padding:0;margin:0"><legend class="t-label" style="margin-bottom:10px">1. La date</legend>' +
          ds.map(function (x, k) {
            var id = 'date-' + k, val = x[0] + 'T' + x[1];
            var coche = dateChoisie ? dateChoisie === val : k === 0;
            return '<label for="' + id + '"><span>' + esc(dateLongue(x[0]).replace(/^./, function (c) { return c.toUpperCase(); })) + ' · ' + esc(heure(x[1])) + '</span><input type="radio" name="date" id="' + id + '" value="' + esc(val) + '"' + (coche ? ' checked' : '') + '></label>';
          }).join('') + '</fieldset>' +
          '<div><p class="t-label" style="margin-bottom:10px">2. Les places</p><div class="quantites">' +
          T.tarifs.map(function (x, k) {
            return '<div class="quantite"><span class="quantite__nom">' + t(x.nom) + '</span><span class="quantite__prix">' + x.prix + '.–</span>' +
              '<span class="compteur"><button type="button" data-moins="' + k + '" aria-label="Retirer une place, ' + esc(x.nom) + '">−</button><output id="q-' + k + '" aria-live="polite">0</output><button type="button" data-plus="' + k + '" aria-label="Ajouter une place, ' + esc(x.nom) + '">+</button></span></div>';
          }).join('') + '</div>' +
          '<p style="font-size:var(--t-petit);margin-top:12px;color:var(--gris-texte)">' + t('Tarif réduit : AVS, AI, étudiant·es et apprenti·es, sur présentation d’un justificatif. Vous choisirez vos places à l’étape suivante.') + '</p></div>' +
        '</div>' +
        '<div class="tiroir__pied"><p class="total"><span>Total</span><strong id="total">0.–</strong></p>' +
          '<button class="btn btn--plein" type="button" id="continuer" disabled>Choisir mes places <span class="fleche" aria-hidden="true">→</span></button>' +
          '<p id="tiroir-msg" class="a-confirmer" hidden></p></div>';
      document.body.appendChild(voile); document.body.appendChild(d);
      document.body.style.overflow = 'hidden';
      function maj() {
        var tot = 0, n = 0;
        T.tarifs.forEach(function (x, k) { tot += q[x.nom] * x.prix; n += q[x.nom]; $('#q-' + k, d).textContent = q[x.nom]; });
        $('#total', d).textContent = tot + '.–';
        $('#continuer', d).disabled = n === 0;
      }
      d.addEventListener('click', function (e) {
        var p = e.target.closest('[data-plus]'), m = e.target.closest('[data-moins]');
        if (p) { var x = T.tarifs[+p.getAttribute('data-plus')]; q[x.nom] = Math.min(10, q[x.nom] + 1); maj(); }
        if (m) { var y = T.tarifs[+m.getAttribute('data-moins')]; q[y.nom] = Math.max(0, q[y.nom] - 1); maj(); }
        if (e.target.closest('.tiroir__fermer')) fermer();
        if (e.target.closest('#continuer')) { var msg = $('#tiroir-msg', d); msg.hidden = false; msg.textContent = typo('Maquette : la suite (choix des places et paiement) s’ouvre ici dans la billetterie en ligne du TBB.'); }
      });
      voile.addEventListener('click', fermer);
      d.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') fermer();
        if (e.key === 'Tab') {
          var f = $$('button:not([disabled]), input, a[href]', d); if (!f.length) return;
          if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        }
      });
      $('.tiroir__fermer', d).focus();
    }
  }

  /* ---------- Page concept : nuancier des encres ---------- */
  function initEncres() {
    var el = $('#encres'); if (!el) return;
    el.innerHTML = spectacles.map(function (s) { var e = encre(s); return '<span style="background:' + e.ink + ';color:' + e.texte + '" title="' + esc(s.titre + ' ' + e.ink) + '">' + t(s.titre) + '</span>'; }).join('');
    var mur = $('#mur-concept'); if (mur) mur.innerHTML = aVenir().slice(0, 10).map(function (s) { return affiche(s); }).join('');
  }

  /* ---------- Démarrage ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initMenu(); initLettre(); initJour(); initUne(); initAgendaAccueil(); initMurAccueil(); initJeunePublic();
    initProgramme(); initSpectacle(); initReservation(); initEncres();
  });
})();
