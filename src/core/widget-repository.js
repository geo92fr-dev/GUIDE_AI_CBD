/**
 * WidgetRepository - Persistence layer for WidgetEntity storage
 * 
 * Provides abstracted storage operations with support for multiple backends
 * (localStorage, IndexedDB, REST API, etc.)
 */

/**
 * Base repository interface
 */
class WidgetRepository {
    constructor() {
        this.storageType = 'base';
    }
    
    async save(entity) {
        throw new Error('save() method must be implemented by subclass');
    }
    
    async load(id) {
        throw new Error('load() method must be implemented by subclass');
    }
    
    async delete(id) {
        throw new Error('delete() method must be implemented by subclass');
    }
    
    async loadAll() {
        throw new Error('loadAll() method must be implemented by subclass');
    }
    
    async clear() {
        throw new Error('clear() method must be implemented by subclass');
    }
}

/**
 * localStorage implementation
 */
class LocalStorageWidgetRepository extends WidgetRepository {
    constructor(keyPrefix = 'widget_entity_') {
        super();
        this.storageType = 'localStorage';
        this.keyPrefix = keyPrefix;
        this.indexKey = this.keyPrefix + 'index';
        
        console.log('💾 LocalStorageRepository: Initialized with prefix:', keyPrefix);
    }
    
    /**
     * Get storage key for entity ID
     */
    getStorageKey(id) {
        return this.keyPrefix + id;
    }
    
    /**
     * Get or create widget index
     */
    getIndex() {
        try {
            const indexData = localStorage.getItem(this.indexKey);
            return indexData ? JSON.parse(indexData) : [];
        } catch (error) {
            console.warn('⚠️ LocalStorageRepository: Failed to load index, creating new:', error);
            return [];
        }
    }
    
    /**
     * Update widget index
     */
    updateIndex(ids) {
        try {
            localStorage.setItem(this.indexKey, JSON.stringify(ids));
        } catch (error) {
            console.error('❌ LocalStorageRepository: Failed to update index:', error);
        }
    }
    
    /**
     * Add ID to index
     */
    addToIndex(id) {
        const index = this.getIndex();
        if (!index.includes(id)) {
            index.push(id);
            this.updateIndex(index);
        }
    }
    
    /**
     * Remove ID from index
     */
    removeFromIndex(id) {
        const index = this.getIndex();
        const filteredIndex = index.filter(existingId => existingId !== id);
        this.updateIndex(filteredIndex);
    }
    
    /**
     * Save widget entity
     */
    async save(entity) {
        console.log('💾 LocalStorageRepository: Saving entity:', entity.id);
        
        try {
            const serialized = entity.serialize();
            const storageKey = this.getStorageKey(entity.id);
            
            localStorage.setItem(storageKey, serialized);
            this.addToIndex(entity.id);
            
            console.log('✅ LocalStorageRepository: Entity saved:', entity.id);
            return true;
        } catch (error) {
            console.error('❌ LocalStorageRepository: Failed to save entity:', error);
            throw error;
        }
    }
    
    /**
     * Load widget entity by ID
     */
    async load(id) {
        console.log('📥 LocalStorageRepository: Loading entity:', id);
        
        try {
            const storageKey = this.getStorageKey(id);
            const serialized = localStorage.getItem(storageKey);
            
            if (!serialized) {
                console.warn('⚠️ LocalStorageRepository: Entity not found:', id);
                return null;
            }
            
            const entity = WidgetEntity.deserialize(serialized);
            console.log('✅ LocalStorageRepository: Entity loaded:', entity.id);
            return entity;
        } catch (error) {
            console.error('❌ LocalStorageRepository: Failed to load entity:', error);
            throw error;
        }
    }
    
    /**
     * Delete widget entity
     */
    async delete(id) {
        console.log('🗑️ LocalStorageRepository: Deleting entity:', id);
        
        try {
            const storageKey = this.getStorageKey(id);
            localStorage.removeItem(storageKey);
            this.removeFromIndex(id);
            
            console.log('✅ LocalStorageRepository: Entity deleted:', id);
            return true;
        } catch (error) {
            console.error('❌ LocalStorageRepository: Failed to delete entity:', error);
            throw error;
        }
    }
    
    /**
     * Load all widget entities
     */
    async loadAll() {
        console.log('📥 LocalStorageRepository: Loading all entities');
        
        try {
            const index = this.getIndex();
            const entities = [];
            
            for (const id of index) {
                try {
                    const entity = await this.load(id);
                    if (entity) {
                        entities.push(entity);
                    }
                } catch (error) {
                    console.warn('⚠️ LocalStorageRepository: Failed to load entity, skipping:', id, error);
                    // Remove invalid ID from index
                    this.removeFromIndex(id);
                }
            }
            
            console.log(`✅ LocalStorageRepository: Loaded ${entities.length} entities`);
            return entities;
        } catch (error) {
            console.error('❌ LocalStorageRepository: Failed to load all entities:', error);
            throw error;
        }
    }
    
    /**
     * Clear all widget entities
     */
    async clear() {
        console.log('🗑️ LocalStorageRepository: Clearing all entities');
        
        try {
            const index = this.getIndex();
            
            // Remove all entity data
            for (const id of index) {
                const storageKey = this.getStorageKey(id);
                localStorage.removeItem(storageKey);
            }
            
            // Clear index
            localStorage.removeItem(this.indexKey);
            
            console.log(`✅ LocalStorageRepository: Cleared ${index.length} entities`);
            return true;
        } catch (error) {
            console.error('❌ LocalStorageRepository: Failed to clear entities:', error);
            throw error;
        }
    }
    
    /**
     * Get storage statistics
     */
    getStats() {
        const index = this.getIndex();
        let totalSize = 0;
        
        // Calculate total storage size
        for (const id of index) {
            const storageKey = this.getStorageKey(id);
            const data = localStorage.getItem(storageKey);
            if (data) {
                totalSize += data.length;
            }
        }
        
        return {
            entityCount: index.length,
            totalSizeBytes: totalSize,
            totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
            storageType: this.storageType,
            keyPrefix: this.keyPrefix
        };
    }
}

/**
 * IndexedDB implementation (more robust for larger datasets)
 */
class IndexedDBWidgetRepository extends WidgetRepository {
    constructor(dbName = 'WidgetPlatform', version = 1) {
        super();
        this.storageType = 'indexedDB';
        this.dbName = dbName;
        this.version = version;
        this.storeName = 'widgets';
        this.db = null;
        
        console.log('🗄️ IndexedDBRepository: Initialized:', dbName);
    }
    
    /**
     * Initialize IndexedDB connection
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => {
                console.error('❌ IndexedDBRepository: Failed to open database');
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDBRepository: Database opened');
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                console.log('🔄 IndexedDBRepository: Upgrading database schema');
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    store.createIndex('type', 'type', { unique: false });
                    store.createIndex('created', 'metadata.created', { unique: false });
                    console.log('✅ IndexedDBRepository: Object store created');
                }
            };
        });
    }
    
    /**
     * Ensure database is initialized
     */
    async ensureDB() {
        if (!this.db) {
            await this.init();
        }
    }
    
    /**
     * Save widget entity
     */
    async save(entity) {
        await this.ensureDB();
        
        console.log('🗄️ IndexedDBRepository: Saving entity:', entity.id);
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            // Convert entity to plain object for IndexedDB
            const entityData = JSON.parse(entity.serialize());
            
            const request = store.put(entityData);
            
            request.onsuccess = () => {
                console.log('✅ IndexedDBRepository: Entity saved:', entity.id);
                resolve(true);
            };
            
            request.onerror = () => {
                console.error('❌ IndexedDBRepository: Failed to save entity:', request.error);
                reject(request.error);
            };
        });
    }
    
    /**
     * Load widget entity by ID
     */
    async load(id) {
        await this.ensureDB();
        
        console.log('🗄️ IndexedDBRepository: Loading entity:', id);
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);
            
            request.onsuccess = () => {
                if (request.result) {
                    try {
                        const entity = new WidgetEntity(request.result);
                        console.log('✅ IndexedDBRepository: Entity loaded:', entity.id);
                        resolve(entity);
                    } catch (error) {
                        console.error('❌ IndexedDBRepository: Failed to deserialize entity:', error);
                        reject(error);
                    }
                } else {
                    console.warn('⚠️ IndexedDBRepository: Entity not found:', id);
                    resolve(null);
                }
            };
            
            request.onerror = () => {
                console.error('❌ IndexedDBRepository: Failed to load entity:', request.error);
                reject(request.error);
            };
        });
    }
    
    /**
     * Delete widget entity
     */
    async delete(id) {
        await this.ensureDB();
        
        console.log('🗄️ IndexedDBRepository: Deleting entity:', id);
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);
            
            request.onsuccess = () => {
                console.log('✅ IndexedDBRepository: Entity deleted:', id);
                resolve(true);
            };
            
            request.onerror = () => {
                console.error('❌ IndexedDBRepository: Failed to delete entity:', request.error);
                reject(request.error);
            };
        });
    }
    
    /**
     * Load all widget entities
     */
    async loadAll() {
        await this.ensureDB();
        
        console.log('🗄️ IndexedDBRepository: Loading all entities');
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();
            
            request.onsuccess = () => {
                try {
                    const entities = request.result.map(data => new WidgetEntity(data));
                    console.log(`✅ IndexedDBRepository: Loaded ${entities.length} entities`);
                    resolve(entities);
                } catch (error) {
                    console.error('❌ IndexedDBRepository: Failed to deserialize entities:', error);
                    reject(error);
                }
            };
            
            request.onerror = () => {
                console.error('❌ IndexedDBRepository: Failed to load all entities:', request.error);
                reject(request.error);
            };
        });
    }
    
    /**
     * Clear all widget entities
     */
    async clear() {
        await this.ensureDB();
        
        console.log('🗄️ IndexedDBRepository: Clearing all entities');
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();
            
            request.onsuccess = () => {
                console.log('✅ IndexedDBRepository: All entities cleared');
                resolve(true);
            };
            
            request.onerror = () => {
                console.error('❌ IndexedDBRepository: Failed to clear entities:', request.error);
                reject(request.error);
            };
        });
    }
}

/**
 * Repository factory for easy instantiation
 */
class WidgetRepositoryFactory {
    static create(type = 'localStorage', config = {}) {
        console.log('🏭 RepositoryFactory: Creating repository:', type);
        
        switch (type) {
            case 'localStorage':
                return new LocalStorageWidgetRepository(config.keyPrefix);
                
            case 'indexedDB':
                return new IndexedDBWidgetRepository(config.dbName, config.version);
                
            default:
                throw new Error(`Unknown repository type: ${type}`);
        }
    }
    
    static getAvailableTypes() {
        return ['localStorage', 'indexedDB'];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        WidgetRepository,
        LocalStorageWidgetRepository,
        IndexedDBWidgetRepository,
        WidgetRepositoryFactory
    };
} else if (typeof window !== 'undefined') {
    window.WidgetRepository = WidgetRepository;
    window.LocalStorageWidgetRepository = LocalStorageWidgetRepository;
    window.IndexedDBWidgetRepository = IndexedDBWidgetRepository;
    window.WidgetRepositoryFactory = WidgetRepositoryFactory;
}