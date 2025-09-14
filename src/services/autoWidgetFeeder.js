// autoWidgetFeeder.js
// Service générique pour le feeding automatique des widgets via leur metadataSchema

/**
 * Mappe dynamiquement les données tabulaires sur le schéma d'un widget.
 * @param {Array<Object>} data - Tableau d'objets (ex: CSV parsé)
 * @param {Object} metadataSchema - Schéma du widget (metadataSchema.fields)
 * @returns {Array<Object>} - Données mappées prêtes à injecter dans le widget
 */
export function autoMapDataToWidgetSchema(data, metadataSchema) {
  if (!Array.isArray(data) || !metadataSchema || !Array.isArray(metadataSchema.fields)) return [];
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  // 1. Déterminer le mapping colonne <-> champ attendu
  const fieldMappings = {};
  metadataSchema.fields.forEach(field => {
    // a. Correspondance exacte (case-insensitive)
    let col = headers.find(h => h.trim().toLowerCase() === field.key.toLowerCase());
    // b. Sinon, par type
    if (!col) {
      if (field.type === 'string') {
        col = headers.find(h => data.some(obj => typeof obj[h] === 'string' && obj[h].trim() !== ''));
      } else if (field.type === 'number') {
        col = headers.find(h => data.some(obj => !isNaN(Number(obj[h])) && obj[h] !== ''));
      }
    }
    fieldMappings[field.key] = col;
  });
  // Correction universelle : si label absent, prendre la première colonne texte ; si value absent, la première numérique
  if (metadataSchema.fields.some(f => f.key === 'label')) {
    if (!fieldMappings['label']) {
      const firstTextCol = headers.find(h => data.some(obj => typeof obj[h] === 'string' && obj[h].trim() !== ''));
      if (firstTextCol) fieldMappings['label'] = firstTextCol;
    }
  }
  if (metadataSchema.fields.some(f => f.key === 'value')) {
    if (!fieldMappings['value']) {
      const firstNumCol = headers.find(h => data.some(obj => !isNaN(Number(obj[h])) && obj[h] !== ''));
      if (firstNumCol) fieldMappings['value'] = firstNumCol;
    }
  }
  // 2. Générer les objets mappés
  const mapped = data.map(obj => {
    const out = {};
    metadataSchema.fields.forEach(field => {
      const col = fieldMappings[field.key];
      let v = col ? obj[col] : undefined;
      if (field.type === 'number') v = Number(v);
      out[field.key] = v;
    });
    return out;
  });
  // 3. Filtrer les lignes incomplètes
  return mapped.filter(obj => metadataSchema.fields.every(f => obj[f.key] !== undefined && obj[f.key] !== '' && (f.type !== 'number' || !isNaN(obj[f.key]))));
}
