/**
 * Swedish visitor texts: the engine's own chrome (navigation, footer,
 * lightbox, gallery, video). The file has the same shape as the engine's
 * locales/site/<code>.js and the keys are identical - the nb base sits
 * underneath, so a key missing here falls back to Norwegian instead of
 * disappearing.
 */
export default {
  lang: 'sv',
  strings: {
    'nav.toFront': 'Till startsidan',
    'nav.toLightTheme': 'Byt till ljust tema',
    'nav.toDarkTheme': 'Byt till mörkt tema',
    'nav.menu': 'Meny',
    'nav.submenuFor': 'Undermeny för {label}',
    'nav.toTop': 'Till toppen',
    'nav.toTopFull': 'Till sidans topp',
    'lightbox.prev': 'Föregående bild',
    'lightbox.next': 'Nästa bild',
    'lightbox.close': 'Stäng',
    'footer.readMore': 'Läs mer',
    'footer.newsletter.subscribe': 'Prenumerera',
    'footer.newsletter.success': 'Tack, du är anmäld!',
    'footer.newsletter.emailPlaceholder': 'din@epost.se',
    'footer.newsletter.emailLabel': 'E-postadress',
    'footer.newsletter.invalidEmail': 'Ange en giltig e-postadress.',
    'footer.newsletter.sendFailed': 'Det gick inte att skicka just nu. Försök igen senare.',
    'footer.newsletter.missingTarget': 'Nyhetsbrevet saknar mottagare eller slutpunkt.',
    'footer.newsletter.mailtoSubject': 'Anmälan till nyhetsbrev',
    'footer.newsletter.mailtoBody': 'Anmäl till nyhetsbrevet: {email}',
    'gallery.prevImages': 'Föregående bilder',
    'gallery.nextImages': 'Nästa bilder',
    'gallery.prevImage': 'Föregående bild',
    'gallery.nextImage': 'Nästa bild',
    'gallery.imageN': 'Bild {n}',
    'video.unknownUrl': 'Okänd videolänk (YouTube och Vimeo stöds)',
    'video.emptyHint': 'Klistra in en YouTube- eller Vimeo-länk i Egenskaper',
    'render.missingPlugin': "Blocktypen '{type}' är inte tillgänglig (saknas en plugin, eller krävs en nyare Urd?)",
  },
};
