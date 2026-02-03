# Neoric Shopify Theme

Custom Shopify Theme für den Neoric Shop.

## Features

- **Responsive Design** - Mobile-first, optimiert für alle Geräte
- **Produkt-Galerie** - Swiper.js mit Peek-Effekt auf Mobile, Thumbnails auf Desktop
- **AJAX Cart Drawer** - Warenkorb als Slide-in ohne Seitenreload
- **Varianten-Auswahl** - Direkte Auswahl mit korrekter Warenkorb-Zuordnung
- **Montserrat Font** - Konsistente Typografie

## Dateistruktur

```
├── assets/
│   ├── base.css              # Basis-Styles, CSS-Variablen, Cart-Drawer
│   ├── custom-theme.css      # Theme-spezifische Anpassungen
│   └── logo-neoric.png       # Shop-Logo
├── config/
│   └── settings_schema.json  # Theme-Einstellungen
├── layout/
│   └── theme.liquid          # Haupt-Layout mit Cart-Drawer & JS
├── locales/
│   └── de.default.json       # Deutsche Übersetzungen
├── sections/
│   ├── announcement-bar.liquid
│   ├── featured-collection.liquid
│   ├── footer.liquid
│   ├── header.liquid
│   ├── main-404.liquid
│   ├── main-collection.liquid
│   ├── main-product.liquid   # Produktseite mit Swiper-Galerie
│   └── trust-icons.liquid
├── snippets/
│   ├── icon-cart.liquid
│   └── product-gallery.liquid
└── templates/
    ├── index.json
    ├── product.json
    ├── collection.json
    └── ...
```

## CSS-Variablen

Definiert in `assets/base.css`:

```css
:root {
  /* Farben */
  --color-primary: #1F47FF;
  --color-primary-hover: #1a3cd6;
  --color-success: #25A525;
  --color-error: #dc3545;

  /* Typografie */
  --font-family: 'Montserrat', sans-serif;

  /* Spacing */
  --spacing-sm: 10px;
  --spacing-md: 15px;
  --spacing-lg: 20px;
  --spacing-xl: 30px;
}
```

## Funktionen

### Cart Drawer
- Öffnet automatisch nach "In den Warenkorb"
- Zeigt Produktbild, Titel, Variante, Preis
- Mengen direkt im Drawer änderbar
- AJAX-basiert (kein Seitenreload)

### Produkt-Galerie (Swiper)
- **Mobile**: Peek-Effekt (nächstes Bild sichtbar), Loop, Touch-Swipe
- **Desktop**: Thumbnails links, Hauptbild rechts, Navigation-Arrows
- Async geladen für bessere Performance

### Varianten
- Dropdown mit allen Varianten
- Ausverkaufte Varianten als "disabled" markiert
- Korrekte Zuordnung beim Hinzufügen zum Warenkorb

## Entwicklung

### Voraussetzungen
- [Shopify CLI](https://shopify.dev/docs/themes/tools/cli)

### Lokale Entwicklung
```bash
shopify theme dev --store=dein-store.myshopify.com
```

### Theme deployen
```bash
shopify theme push
```

## Abhängigkeiten

- **Swiper.js v11** - Produkt-Galerie (CDN, async geladen)
- **Google Fonts** - Montserrat

## Browser-Support

- Chrome (aktuell)
- Firefox (aktuell)
- Safari (aktuell)
- Edge (aktuell)
- Mobile Browser (iOS Safari, Chrome Android)
