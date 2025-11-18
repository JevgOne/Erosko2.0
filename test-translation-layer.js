/**
 * Test the translation layer locally
 */

// Simulate the translation function
const filterValueMappings = {
  hairColor: {
    'Blond': 'blonde',
    'Hnědá': 'brunette',
    'Černá': 'black',
    'Zrzavá': 'red',
    'Jiná': 'other',
  },
  bodyType: {
    'Štíhlá': 'slim',
    'Atletická': 'athletic',
    'Průměrná': 'curvy',
    'Kulatá': 'curvy',
    'Plus size': 'plus-size',
  },
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
  tattoos: {
    'Ano': 'medium',
    'Ne': 'none',
    'Malé': 'small',
  },
  piercing: {
    'Ano': 'multiple',
    'Ne': 'none',
    'Jen uši': 'ears',
  },
};

function translateFilterValue(filterType, czechValue) {
  const mapping = filterValueMappings[filterType];
  if (!mapping) return czechValue;

  return mapping[czechValue] || czechValue.toLowerCase();
}

// Test cases
console.log('Testing translation layer:');
console.log('Blond ->', translateFilterValue('hairColor', 'Blond')); // Should be 'blonde'
console.log('Štíhlá ->', translateFilterValue('bodyType', 'Štíhlá')); // Should be 'slim'
console.log('Česká ->', translateFilterValue('nationality', 'Česká')); // Should be 'czech'
console.log('Ano (tattoo) ->', translateFilterValue('tattoos', 'Ano')); // Should be 'medium'
console.log('Ne (piercing) ->', translateFilterValue('piercing', 'Ne')); // Should be 'none'
