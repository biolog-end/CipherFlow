/**
 * Evaluates a node graph. Pure logic: no DOM, no globals except NodeRegistry.
 *
 * Forward (encrypt) mode: data flows from "input" nodes along connections to "output" nodes.
 * Reverse (decrypt) mode: data connections are flipped, so text enters through "output" nodes,
 * every node runs with ctx.reverse = true, and results are collected at "input" nodes.
 * Connections into "param" ports (keys) keep their forward direction in both modes.
 */
class ChainExecutor {
    /**
     * Longest text a node may produce. Chains of expanding nodes grow exponentially, and beyond
     * this size the browser can neither display nor copy the result anyway.
     */
    static MAX_TEXT_LENGTH = 20000000;

    /**
     * @param {(key: string, params?: object) => string} translate i18n lookup used for error messages
     */
    constructor(translate) {
        this.t = translate;
    }

    static formatLength(n) {
        return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    /**
     * @param {object} graph
     * @param {Array<{id: string, type: string, values: object}>} graph.nodes
     * @param {Array<{id: string, from: {nodeId: string, port: string}, to: {nodeId: string, port: string}}>} graph.connections
     * @param {boolean} graph.reverse
     * @param {string} graph.sourceText
     * @returns {{ results: Map<string, object>, output: string, terminals: Map<string, string> }}
     */
    run({ nodes, connections, reverse, sourceText }) {
        if (sourceText.length > ChainExecutor.MAX_TEXT_LENGTH) {
            throw new Error(this.t('error.source_too_large', {
                length: ChainExecutor.formatLength(sourceText.length),
                limit: ChainExecutor.formatLength(ChainExecutor.MAX_TEXT_LENGTH),
            }));
        }
        const nodeMap = new Map(nodes.filter(n => NodeRegistry.has(n.type)).map(n => [n.id, n]));
        const edges = connections.filter(c => nodeMap.has(c.from.nodeId) && nodeMap.has(c.to.nodeId));

        const isParamEdge = (edge) => {
            const def = NodeRegistry.get(nodeMap.get(edge.to.nodeId).type);
            return def.inputs.some(p => p.name === edge.to.port && p.kind === 'param');
        };

        // Orientation of each edge for the main pass: { source, target } in evaluation direction.
        const oriented = edges.map(edge => {
            const param = isParamEdge(edge);
            const flip = reverse && !param;
            return {
                edge,
                param,
                source: flip ? edge.to.nodeId : edge.from.nodeId,
                target: flip ? edge.from.nodeId : edge.to.nodeId,
            };
        });

        const order = this.topologicalOrder([...nodeMap.keys()], oriented);
        const results = new Map();
        const terminals = new Map();
        const forwardCache = new Map();

        const valueOf = (nodeId, port) => {
            const r = results.get(nodeId);
            return r && typeof r[port] === 'string' ? r[port] : '';
        };

        /** Forward-only evaluation used for key sources while running in reverse mode. */
        const evalForward = (nodeId, visiting = new Set()) => {
            if (forwardCache.has(nodeId)) return forwardCache.get(nodeId);
            if (visiting.has(nodeId)) return {};
            visiting.add(nodeId);
            const node = nodeMap.get(nodeId);
            const def = NodeRegistry.get(node.type);
            const entry = {};
            const params = {};
            for (const port of def.inputs) {
                const incoming = edges.filter(e => e.to.nodeId === nodeId && e.to.port === port.name);
                const values = incoming.map(e => (evalForward(e.from.nodeId, visiting)[e.from.port] ?? ''));
                (port.kind === 'param' ? params : entry)[port.name] = values.find(v => v !== '') ?? '';
            }
            const exit = this.invoke(node, def, { reverse: false, sourceText, entry, params, entryPorts: NodeRegistry.dataInputs(def), exitPorts: def.outputs });
            forwardCache.set(nodeId, exit);
            return exit;
        };

        for (const nodeId of order) {
            const node = nodeMap.get(nodeId);
            const def = NodeRegistry.get(node.type);
            const entryPorts = reverse ? def.outputs : NodeRegistry.dataInputs(def);
            const exitPorts = reverse ? NodeRegistry.dataInputs(def) : def.outputs;

            const entry = {};
            for (const port of entryPorts) {
                const feeding = oriented.filter(o => !o.param && o.target === nodeId && (reverse ? o.edge.from.port : o.edge.to.port) === port.name);
                const values = feeding.map(o => valueOf(o.source, reverse ? o.edge.to.port : o.edge.from.port));
                entry[port.name] = values.find(v => v !== '') ?? '';
            }

            const params = {};
            for (const port of NodeRegistry.paramInputs(def)) {
                const feeding = edges.filter(e => e.to.nodeId === nodeId && e.to.port === port.name);
                const values = feeding.map(e => reverse ? (evalForward(e.from.nodeId)[e.from.port] ?? '') : valueOf(e.from.nodeId, e.from.port));
                params[port.name] = values.find(v => v !== '') ?? '';
            }

            const exit = this.invoke(node, def, { reverse, sourceText, entry, params, entryPorts, exitPorts });
            results.set(nodeId, exit);

            const terminalRole = reverse ? 'input' : 'output';
            if (def.role === terminalRole) terminals.set(nodeId, exit.$ ?? '');
        }

        const output = [...terminals.values()].filter(v => v !== '').join('\n');
        return { results, output, terminals };
    }

    /** Calls a node's process() with a normalised entry and normalises its exit to { port: string }. */
    invoke(node, def, { reverse, sourceText, entry, params, entryPorts, exitPorts }) {
        const isSource = entryPorts.length === 0;
        const singleEntry = entryPorts.length === 1;
        const ctx = {
            reverse,
            fields: { ...NodeRegistry.defaultValues(def), ...(node.values || {}) },
            params,
            t: this.t,
            node,
            sourceText,
            isSource,
        };
        let raw;
        try {
            raw = def.process(ctx, singleEntry ? entry[entryPorts[0].name] : entry);
        } catch (error) {
            console.error(`Node "${node.type}" failed:`, error);
            raw = this.t('error.node_processing', { message: error.message });
        }
        const exit = this.normalizeExit(raw, exitPorts);
        for (const value of Object.values(exit)) {
            if (value.length > ChainExecutor.MAX_TEXT_LENGTH) {
                throw new Error(this.t('error.text_too_large', {
                    node: node.title || this.t(def.title),
                    length: ChainExecutor.formatLength(value.length),
                    limit: ChainExecutor.formatLength(ChainExecutor.MAX_TEXT_LENGTH),
                }));
            }
        }
        return exit;
    }

    normalizeExit(raw, exitPorts) {
        const exit = {};
        if (exitPorts.length === 0) {
            exit.$ = typeof raw === 'string' ? raw : (raw == null ? '' : String(raw));
            return exit;
        }
        if (raw !== null && typeof raw === 'object') {
            for (const port of exitPorts) exit[port.name] = typeof raw[port.name] === 'string' ? raw[port.name] : '';
            return exit;
        }
        const text = raw == null ? '' : String(raw);
        for (const port of exitPorts) exit[port.name] = text;
        return exit;
    }

    /** Kahn-style DFS ordering; back edges (cycles) are ignored rather than fatal. */
    topologicalOrder(nodeIds, oriented) {
        const deps = new Map(nodeIds.map(id => [id, new Set()]));
        for (const { source, target } of oriented) deps.get(target).add(source);

        const state = new Map();
        const order = [];
        const visit = (id) => {
            if (state.get(id) === 'done') return;
            if (state.get(id) === 'active') return;
            state.set(id, 'active');
            for (const dep of deps.get(id)) visit(dep);
            state.set(id, 'done');
            order.push(id);
        };
        for (const id of nodeIds) visit(id);
        return order;
    }
}

EngineModules.defineClass(ChainExecutor);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChainExecutor;
}
