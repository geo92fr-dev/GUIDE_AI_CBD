/**
 * 🔄 Widget View Toggle Component
 * 
 * Composant toggle pour basculer entre mode View (rendu widget) et Info (métadonnées)
 * Selon WIDGET_TECH_SPEC.md - widgets business avec palette couleurs officielle
 */

class WidgetViewToggle extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // State
        this._isViewMode = true; // false = Info mode, true = View mode (DEFAULT: VIEW)
        this._widgetId = null;
        this._disabled = false;
        
        this.render();
        this.bindEvents();
    }

    static get observedAttributes() {
        return ['widget-id', 'view-mode', 'disabled'];
    }

    connectedCallback() {
        // S'assurer que les attributs sont traités après l'ajout au DOM
        if (this.hasAttribute('view-mode')) {
            this._isViewMode = this.getAttribute('view-mode') === 'true';
        }
        if (this.hasAttribute('widget-id')) {
            this._widgetId = this.getAttribute('widget-id');
        }
        if (this.hasAttribute('disabled')) {
            this._disabled = this.hasAttribute('disabled');
        }
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'widget-id':
                this._widgetId = newValue;
                break;
            case 'view-mode':
                this._isViewMode = newValue === 'true';
                break;
            case 'disabled':
                this._disabled = newValue !== null;
                break;
        }
        this.render();
    }

    get isViewMode() {
        return this._isViewMode;
    }

    set isViewMode(value) {
        this._isViewMode = Boolean(value);
        this.setAttribute('view-mode', this._isViewMode.toString());
        this.render();
        this.dispatchToggleEvent();
    }

    get widgetId() {
        return this._widgetId;
    }

    set widgetId(value) {
        this._widgetId = value;
        this.setAttribute('widget-id', value);
    }

    get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = Boolean(value);
        if (this._disabled) {
            this.setAttribute('disabled', '');
        } else {
            this.removeAttribute('disabled');
        }
        this.render();
    }

    render() {
        const currentMode = this._isViewMode ? 'View' : 'Info';
        const nextMode = this._isViewMode ? 'Info' : 'View';
        const currentIcon = this._isViewMode ? '📊' : 'ℹ️';
        const nextIcon = this._isViewMode ? 'ℹ️' : '📊';
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    font-family: var(--font-family-base, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
                }
                
                .toggle-container {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .toggle-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    padding: 6px 10px;
                    border: 1px solid var(--border-light, #1A2733);
                    border-radius: var(--radius-sm, 4px);
                    background: var(--background-secondary, #1A2733);
                    color: var(--text-primary, #EAECEE);
                    font-size: 0.8em;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all var(--transition-fast, 0.15s ease);
                    min-width: 80px;
                    user-select: none;
                }
                
                .toggle-button:hover:not(:disabled) {
                    background: var(--background-primary, #12171C);
                    border-color: var(--business-blue, #1B90FF);
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(27, 144, 255, 0.2);
                }
                
                .toggle-button:active:not(:disabled) {
                    transform: translateY(0);
                    box-shadow: 0 1px 4px rgba(27, 144, 255, 0.3);
                }
                
                .toggle-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background: var(--background-tertiary, #00144A);
                    color: var(--text-disabled, #A9B4BE);
                }
                
                .toggle-button.view-mode {
                    background: var(--business-blue, #1B90FF);
                    border-color: var(--business-blue-dark, #0066CC);
                    color: var(--text-inverse, #FFFFFF);
                }
                
                .toggle-button.view-mode:hover:not(:disabled) {
                    background: var(--business-blue-dark, #0066CC);
                    border-color: var(--business-blue-darker, #004499);
                }
                
                .toggle-icon {
                    font-size: 1.1em;
                    display: flex;
                    align-items: center;
                }
                
                .toggle-text {
                    font-weight: 600;
                    letter-spacing: 0.02em;
                }
                
                .mode-indicator {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    border: 1px solid var(--background-secondary, #1A2733);
                    transition: background-color var(--transition-fast, 0.15s ease);
                }
                
                .mode-indicator.info-mode {
                    background: var(--warning-color, #FF9500);
                }
                
                .mode-indicator.view-mode {
                    background: var(--success-color, #30C330);
                }
                
                /* Animation pour le changement d'état */
                .toggle-button .toggle-icon,
                .toggle-button .toggle-text {
                    transition: all var(--transition-fast, 0.15s ease);
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                
                .toggle-button.toggling {
                    animation: pulse 0.2s ease-in-out;
                }
            </style>
            
            <div class="toggle-container">
                <button class="toggle-button ${this._isViewMode ? 'view-mode' : 'info-mode'}" 
                        ${this._disabled ? 'disabled' : ''}
                        title="Toggle between ${nextMode} and ${currentMode} mode">
                    <span class="toggle-icon">${currentIcon}</span>
                    <span class="toggle-text">${currentMode}</span>
                </button>
                <div class="mode-indicator ${this._isViewMode ? 'view-mode' : 'info-mode'}"></div>
            </div>
        `;
    }

    bindEvents() {
        this.shadowRoot.addEventListener('click', (e) => {
            const button = e.target.closest('.toggle-button');
            if (button && !this._disabled) {
                this.toggle();
            }
        });
    }

    toggle() {
        if (this._disabled) return;
        
        // Animation visuelle
        const button = this.shadowRoot.querySelector('.toggle-button');
        button.classList.add('toggling');
        
        setTimeout(() => {
            button.classList.remove('toggling');
            // Utiliser le setter pour déclencher render() et dispatchToggleEvent()
            this.isViewMode = !this._isViewMode;
        }, 100);
    }

    dispatchToggleEvent() {
        this.dispatchEvent(new CustomEvent('widget-view-toggle', {
            detail: {
                widgetId: this._widgetId,
                isViewMode: this._isViewMode,
                mode: this._isViewMode ? 'view' : 'info'
            },
            bubbles: true,
            composed: true
        }));
        
        console.log('🔄 Widget Toggle:', this._widgetId, '→', this._isViewMode ? 'VIEW' : 'INFO');
    }

    // Méthodes utilitaires
    enableViewMode() {
        this.isViewMode = true;
    }

    enableInfoMode() {
        this.isViewMode = false;
    }

    enable() {
        this.disabled = false;
    }

    disable() {
        this.disabled = true;
    }
}

// Enregistrer le composant
customElements.define('widget-view-toggle', WidgetViewToggle);

// Export pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WidgetViewToggle;
}