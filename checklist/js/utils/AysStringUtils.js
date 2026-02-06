/**
 * AysStringUtils — String Normalization Utilities
 * 
 * Centralizes defensive string handling patterns that were previously
 * scattered across the codebase as repetitive inline code.
 * 
 * @module utils/AysStringUtils
 * @version 1.0.0
 */
const AysStringUtils = {

    /**
     * Safely convert any value to a trimmed string, or null if empty.
     * Handles null, undefined, numbers, booleans, objects.
     * 
     * @param {*} value - Any input value
     * @returns {string|null} Trimmed string or null if empty
     * 
     * @example
     * toTrimmedString('  hello  ')  // 'hello'
     * toTrimmedString(null)         // null
     * toTrimmedString('')           // null
     * toTrimmedString(123)          // '123'
     */
    toTrimmedString(value) {
        const trimmed = (value ?? '').toString().trim();
        return trimmed || null;
    },

    /**
     * Get trimmed value from a jQuery selector, or null if empty.
     * Assumes jQuery is available globally.
     * 
     * @param {string} selector - jQuery selector string
     * @returns {string|null} Trimmed value or null
     * 
     * @example
     * getInputValue('#quote-client-name')  // 'John Doe' or null
     */
    getInputValue(selector) {
        // eslint-disable-next-line no-undef
        return this.toTrimmedString($(selector).val());
    },

    /**
     * Extract the first non-empty value from an object using multiple possible keys.
     * Tries each key in order and returns the first truthy trimmed value.
     * 
     * @param {object} obj - Source object to extract from
     * @param {...string} keys - Keys to try in priority order
     * @returns {string|null} First non-empty value found, or null
     * 
     * @example
     * const data = { client_name: '', name: 'John', full_name: 'John Doe' };
     * extractFirst(data, 'client_name', 'name', 'full_name')  // 'John'
     * 
     * @example
     * // Common usage for flexible API responses:
     * const name = extractFirst(obj, 'name', 'client_name', 'full_name', 'ays_name');
     * const email = extractFirst(obj, 'email', 'client_email', 'ays_email');
     */
    extractFirst(obj, ...keys) {
        if (!obj || typeof obj !== 'object') return null;
        
        for (const key of keys) {
            const val = this.toTrimmedString(obj[key]);
            if (val) return val;
        }
        return null;
    },

    /**
     * Check if a value is empty after trimming.
     * Considers null, undefined, empty string, and whitespace-only as empty.
     * 
     * @param {*} value - Value to check
     * @returns {boolean} True if empty
     * 
     * @example
     * isEmpty('')        // true
     * isEmpty('   ')     // true
     * isEmpty(null)      // true
     * isEmpty('hello')   // false
     */
    isEmpty(value) {
        return this.toTrimmedString(value) === null;
    },

    /**
     * Check if a value is non-empty after trimming.
     * 
     * @param {*} value - Value to check
     * @returns {boolean} True if has content
     */
    hasContent(value) {
        return !this.isEmpty(value);
    },

    /**
     * Coalesce multiple values, returning the first non-empty one.
     * Similar to extractFirst but for direct values, not object keys.
     * 
     * @param {...*} values - Values to try in order
     * @returns {string|null} First non-empty value or null
     * 
     * @example
     * coalesce('', null, 'default')  // 'default'
     * coalesce('first', 'second')    // 'first'
     */
    coalesce(...values) {
        for (const val of values) {
            const trimmed = this.toTrimmedString(val);
            if (trimmed) return trimmed;
        }
        return null;
    },

    /**
     * Normalize a phone number by removing common formatting characters.
     * Keeps only digits, +, and leading zeros.
     * 
     * @param {string} phone - Raw phone input
     * @returns {string|null} Normalized phone or null
     * 
     * @example
     * normalizePhone('(555) 123-4567')  // '5551234567'
     * normalizePhone('+64 21 123 4567') // '+64211234567'
     */
    normalizePhone(phone) {
        const raw = this.toTrimmedString(phone);
        if (!raw) return null;
        
        // Keep only digits and leading +
        const normalized = raw.replace(/[^\d+]/g, '');
        return normalized || null;
    },

    /**
     * Normalize an email address (lowercase, trimmed).
     * Does NOT validate — just normalizes for storage.
     * 
     * @param {string} email - Raw email input
     * @returns {string|null} Lowercase trimmed email or null
     */
    normalizeEmail(email) {
        const raw = this.toTrimmedString(email);
        return raw ? raw.toLowerCase() : null;
    }
};

// Freeze to prevent accidental mutation
Object.freeze(AysStringUtils);

// Export for module systems, also attach to window for legacy global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AysStringUtils;
}
if (typeof window !== 'undefined') {
    window.AysStringUtils = AysStringUtils;
}
