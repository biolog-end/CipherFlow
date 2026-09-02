/**
 * Registry of the scripts that make up the cipher engine (helpers, node definitions, executor).
 *
 * The app runs from file://, where a Web Worker cannot load script files. Every engine script
 * registers its code here as a function, so the exact same code can be re-assembled from
 * function sources into a Blob worker. A registered function must only rely on globals defined
 * by modules registered before it (TextUtils, Morse, NodeRegistry, i18n).
 */
const EngineModules = (() => {
    const modules = [];

    /**
     * Evaluates `factory` right away and remembers it. With a `name`, the returned value becomes
     * a global of that name inside the worker; without one the factory only has side effects
     * (node files registering themselves).
     */
    function define(name, factory) {
        if (typeof name === 'function') {
            factory = name;
            name = null;
        }
        modules.push({ name, source: factory.toString() });
        return factory();
    }

    /** Registers a class declared with a plain `class` statement (its source is self-contained). */
    function defineClass(ctor) {
        modules.push({ name: null, source: ctor.toString() });
        return ctor;
    }

    /** Source code that recreates every registered module, in order, in a fresh global scope. */
    function source() {
        return modules
            .map(m => (m.name ? `var ${m.name} = (${m.source})();` : (m.source.startsWith('class ') ? m.source : `(${m.source})();`)))
            .join('\n\n');
    }

    return Object.freeze({ define, defineClass, source });
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EngineModules;
}
