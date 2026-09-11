// Reference list of common beer styles for the "Estilo" field, grouped the
// way brewers usually think about them (roughly BJCP families, simplified).
export const BEER_STYLE_GROUPS: { group: string; styles: string[] }[] = [
  {
    group: "Ales",
    styles: [
      "Pale Ale Americana",
      "India Pale Ale (IPA)",
      "New England IPA (NEIPA)",
      "West Coast IPA",
      "Double/Imperial IPA",
      "Session IPA",
      "Brown Ale",
      "Amber Ale",
      "Red Ale",
      "Blonde Ale",
      "Golden Ale",
      "Scotch Ale",
      "Barleywine",
      "Old Ale",
      "English Bitter/ESB",
      "Cream Ale",
      "Kölsch",
      "Altbier",
      "California Common (Steam Beer)",
    ],
  },
  {
    group: "Stouts y porters",
    styles: [
      "Porter",
      "Robust Porter",
      "Baltic Porter",
      "Dry Stout (Irish Stout)",
      "Sweet/Milk Stout",
      "Oatmeal Stout",
      "Imperial Stout",
      "Coffee Stout",
      "Pastry Stout",
    ],
  },
  {
    group: "Cervezas de trigo",
    styles: ["Hefeweizen", "Witbier", "American Wheat", "Dunkelweizen", "Weizenbock", "Berliner Weisse"],
  },
  {
    group: "Estilos belgas",
    styles: [
      "Belgian Blonde",
      "Belgian Dubbel",
      "Belgian Tripel",
      "Belgian Quadrupel",
      "Saison",
      "Belgian Strong Golden Ale",
      "Belgian Strong Dark Ale",
    ],
  },
  {
    group: "Ácidas y silvestres",
    styles: [
      "Lambic",
      "Gueuze",
      "Flanders Red",
      "Fruit Lambic (Kriek/Framboise)",
      "Sour Ale (Kettle Sour)",
      "Gose",
      "Cerveza con Brettanomyces",
    ],
  },
  {
    group: "Lagers",
    styles: [
      "Pilsner Bohemia",
      "Pilsner Alemana",
      "Helles",
      "Märzen/Oktoberfest",
      "Vienna Lager",
      "Dunkel",
      "Schwarzbier",
      "Bock",
      "Doppelbock",
      "Eisbock",
      "American Lager",
      "American Light Lager",
    ],
  },
  {
    group: "Especiales",
    styles: [
      "Rauchbier (ahumada)",
      "Cerveza frutal",
      "Cerveza especiada/con hierbas",
      "Cerveza con miel",
      "Pumpkin Ale",
      "Envejecida en madera/barrica",
      "Cerveza sin alcohol",
    ],
  },
];

export const BEER_STYLES: string[] = BEER_STYLE_GROUPS.flatMap((g) => g.styles);

export const OTHER_STYLE = "Otro (especificar)";
