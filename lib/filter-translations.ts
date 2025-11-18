/**
 * Filter value translations: Czech (UI) → English (Database)
 *
 * SearchBar uses Czech values for user experience,
 * but database stores English values.
 * This mapping ensures filters work correctly.
 */

export const filterValueMappings = {
  // Barva vlasů (Hair Color)
  hairColor: {
    'Blond': 'blonde',
    'Hnědá': 'brunette',
    'Černá': 'black',
    'Zrzavá': 'red',
    'Jiná': 'other',
  },

  // Barva očí (Eye Color) - Currently not used (0% data in DB)
  eyeColor: {
    'Modré': 'blue',
    'Zelené': 'green',
    'Hnědé': 'brown',
    'Šedé': 'hazel',
    'Jiné': 'other',
  },

  // Typ postavy (Body Type)
  bodyType: {
    'Štíhlá': 'slim',
    'Atletická': 'athletic',
    'Průměrná': 'curvy',
    'Kulatá': 'curvy',
    'Plus size': 'plus-size',
  },

  // Národnost/Etnikum (Nationality)
  nationality: {
    'Česká': 'czech',
    'Slovenská': 'slovak',
    'Polská': 'polish',
    'Ukrajinská': 'ukrainian',
    'Ruská': 'russian',
    'Asijská': 'asian',
    'Latina': 'latina',
    'Africká': 'african',
    'Jiná': 'other',
  },

  // Tetování (Tattoos)
  tattoos: {
    'Ano': 'medium',
    'Ne': 'none',
    'Malé': 'small',
  },

  // Piercing
  piercing: {
    'Ano': 'multiple',
    'Ne': 'none',
    'Jen uši': 'ears',
  },
};

/**
 * Translate Czech filter value to English database value
 */
export function translateFilterValue(
  filterType: keyof typeof filterValueMappings,
  czechValue: string
): string {
  const mapping = filterValueMappings[filterType];
  if (!mapping) return czechValue;

  return mapping[czechValue as keyof typeof mapping] || czechValue.toLowerCase();
}

/**
 * Translate multiple values (for multi-select filters)
 */
export function translateFilterValues(
  filterType: keyof typeof filterValueMappings,
  czechValues: string[]
): string[] {
  return czechValues.map(value => translateFilterValue(filterType, value));
}
