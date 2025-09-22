/**
 * 📊 CSV DATA SOURCE SERVICE - VERSION SIMPLE
 * 
 * Service pour découvrir et charger les fichiers CSV du dossier samples/
 * Compatible avec serveur HTTP simple.
 */

class CSVDataSourceService {
    constructor() {
        this.samplesPath = 'samples/';
        this.discoveredSources = [];
        this.sourceCache = new Map();
    }

    /**
     * Découvre tous les fichiers CSV avec liste prédéfinie
     * @returns {Promise<Array>} Liste des sources CSV
     */
    async discoverCSVSources() {
        window.logIf('CSV_DISCOVERY', '📊 Discovering CSV files...');
        
        try {
            const csvSources = await this.getKnownCSVFiles();
            this.discoveredSources = csvSources;
            window.logIf('CSV_DISCOVERY', `🔍 Simple Discovery: Found ${csvSources.length} CSV files`);
            return csvSources;
            
        } catch (error) {
            console.error('❌ CSV discovery failed:', error.message);
            throw new Error(`CSV Discovery Service indisponible: ${error.message}`);
        }
    }

    /**
     * Retourne la liste des fichiers CSV connus
     * @returns {Promise<Array>} Sources CSV
     */
    async getKnownCSVFiles() {
        window.logIf('CSV_DISCOVERY', '🔍 SIMPLE MODE: Using known CSV list...');
        
        const knownCSVFiles = [
            'customer-orders.csv',
            'finance-data.csv', 
            'hr-data.csv',
            'kpi-data.csv',
            'marketing-data.csv',
            'production-data.csv',
            'sales-data.csv',
            'stock-market-data.csv'
        ];
        
        const csvSources = [];
        
        for (const fileName of knownCSVFiles) {
            // Utilisation de chemins relatifs depuis le serveur principal
            const relativePath = `./samples/${fileName}`;
            
            try {
                // Test simple d'existence du fichier
                const response = await fetch(relativePath, { method: 'HEAD' });
                if (response.ok) {
                    csvSources.push({
                        fileName: fileName,
                        name: this.formatFileName(fileName),
                        path: `samples/${fileName}`, // Chemin relatif pour l'usage interne
                        fullPath: relativePath, // Chemin relatif pour le chargement
                        size: 'Unknown',
                        rowCount: 'Unknown', // Ajout de rowCount pour le rendu
                        lastModified: new Date().toISOString(),
                        description: `Data from ${fileName.replace('.csv', '').replace('-', ' ')}`
                    });
                    window.logIf('CSV_DISCOVERY', `✅ CSV file accessible: ${fileName}`);
                } else {
                    console.warn(`⚠️ CSV file not accessible (${response.status}): ${fileName}`);
                }
            } catch (error) {
                console.warn(`⚠️ CSV file error: ${fileName} -`, error.message);
            }
        }
        
        window.logIf('CSV_DISCOVERY', `🔍 Simple CSV Discovery: Found ${csvSources.length}/${knownCSVFiles.length} accessible files`);
        return csvSources;
    }

    /**
     * Formate le nom de fichier pour l'affichage
     * @param {string} fileName - Nom du fichier
     * @returns {string} Nom formaté
     */
    formatFileName(fileName) {
        return fileName
            .replace('.csv', '')
            .replace(/-/g, ' ')
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Charge un fichier CSV
     * @param {string} fileName - Nom du fichier CSV
     * @returns {Promise<Array>} Données du CSV
     */
    async loadCSVFile(fileName) {
        console.log(`📥 Loading CSV file: ${fileName}`);
        
        if (this.sourceCache.has(fileName)) {
            console.log(`🔄 Using cached data for: ${fileName}`);
            return this.sourceCache.get(fileName);
        }
        
        try {
            // Utilisation de chemin relatif depuis le serveur principal
            const filePath = `./samples/${fileName}`;
            const response = await fetch(filePath);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch ${fileName}: ${response.status} ${response.statusText}`);
            }
            
            const csvContent = await response.text();
            const data = this.parseCSV(csvContent);
            
            // Mettre en cache
            this.sourceCache.set(fileName, data);
            
            return data;
        } catch (error) {
            console.error(`❌ Error loading CSV ${fileName}:`, error);
            throw error;
        }
    }

    /**
     * Parse simple du CSV
     * @param {string} csvContent 
     * @returns {Array} Données parsées
     */
    parseCSV(csvContent) {
        const lines = csvContent.trim().split('\n');
        if (lines.length < 2) {
            return [];
        }
        
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            
            data.push(row);
        }
        
        return data;
    }

    /**
     * Obtient les sources découvertes
     * @returns {Array} Sources CSV découvertes
     */
    getDiscoveredSources() {
        return this.discoveredSources;
    }

    /**
     * Obtient un aperçu d'un fichier CSV (premières lignes)
     * @param {string} fileName - Nom du fichier
     * @param {number} maxRows - Nombre maximum de lignes
     * @returns {Promise<Object>} Aperçu avec métadonnées
     */
    async previewCSV(fileName, maxRows = 5) {
        try {
            const data = await this.loadCSVFile(fileName);
            const preview = data.slice(0, maxRows);
            
            return {
                fileName: fileName,
                totalRows: data.length,
                previewRows: preview.length,
                headers: preview.length > 0 ? Object.keys(preview[0]) : [],
                data: preview
            };
        } catch (error) {
            console.error(`❌ Error previewing CSV ${fileName}:`, error);
            throw error;
        }
    }
}

// Instance globale
window.CSVDataSourceService = CSVDataSourceService;
window.csvDataSourceService = new CSVDataSourceService();

console.log('📊 CSV Data Source Service initialized (simple version)');