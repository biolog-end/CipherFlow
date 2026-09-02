/**
 * The help window. The "Algorithms" section is generated from the node registry: every node's
 * definition carries its own help blocks, so a new node documents itself.
 */
class HelpSystem {
    constructor(app) {
        this.app = app;
        this.modal = null;
        this.section = 'overview';
    }

    get isOpen() {
        return Boolean(this.modal);
    }

    show(section = null) {
        if (this.modal) {
            if (section) this.switchSection(section);
            return;
        }
        this.modal = UI.modal({
            title: i18n.t('help.title'),
            icon: 'fas fa-book',
            className: 'modal-help',
            bodyHtml: this.renderLayout(),
            onClose: () => { this.modal = null; },
        });
        const { overlay } = this.modal;
        overlay.querySelectorAll('.help-nav-item').forEach(item => {
            item.addEventListener('click', () => this.switchSection(item.dataset.section));
        });
        overlay.querySelectorAll('[data-example]').forEach(button => {
            button.addEventListener('click', () => {
                this.hide();
                this.app.files.loadExample(button.dataset.example);
            });
        });
        this.switchSection(section || this.section);
    }

    hide() {
        if (this.modal) this.modal.close();
        this.modal = null;
    }

    /** Opens the help on the card of a node type and highlights it. */
    showNode(type) {
        this.show('algorithms');
        const card = this.modal.overlay.querySelector(`.help-card[data-node-type="${type}"]`);
        if (!card) return;
        setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.add('is-highlighted');
            setTimeout(() => card.classList.remove('is-highlighted'), 2500);
        }, 200);
    }

    switchSection(id) {
        this.section = id;
        const { overlay } = this.modal;
        overlay.querySelectorAll('.help-nav-item').forEach(item => item.classList.toggle('active', item.dataset.section === id));
        overlay.querySelectorAll('.help-section').forEach(section => section.classList.toggle('active', section.dataset.section === id));
        overlay.querySelector('.help-content').scrollTop = 0;
    }

    /* ---------- rendering ---------- */

    t(key) {
        return UI.escapeHtml(i18n.t(key));
    }

    has(key) {
        return typeof i18n.translations[i18n.getCurrentLanguage()]?.[key] === 'string';
    }

    /** Some help strings intentionally contain <strong>; everything else is escaped. */
    rich(key) {
        return UI.escapeHtml(i18n.t(key)).replace(/&lt;(\/?strong)&gt;/g, '<$1>').replace(/\\n|\n/g, '<br>');
    }

    renderLayout() {
        const nav = [
            ['overview', 'fa-home', 'help.navigation.overview'],
            ['algorithms', 'fa-cogs', 'help.navigation.algorithms'],
            ['data-loss', 'fa-exclamation-triangle', 'help.navigation.data_loss'],
            ['examples', 'fa-lightbulb', 'help.navigation.examples'],
            ['hotkeys', 'fa-keyboard', 'help.navigation.hotkeys'],
        ];
        return `
            <nav class="help-sidebar">
                ${nav.map(([id, icon, key]) => `<button class="help-nav-item" data-section="${id}"><i class="fas ${icon}"></i><span>${this.t(key)}</span></button>`).join('')}
            </nav>
            <div class="help-content">
                ${this.renderOverview()}
                ${this.renderAlgorithms()}
                ${this.renderDataLoss()}
                ${this.renderExamples()}
                ${this.renderHotkeys()}
            </div>`;
    }

    renderOverview() {
        const feature = (icon, titleKey, descKey) => `
            <div class="help-feature">
                <i class="fas ${icon}"></i>
                <div><h4>${this.t(titleKey)}</h4><p>${this.t(descKey)}</p></div>
            </div>`;
        return `
            <section class="help-section" data-section="overview">
                <h2>${this.t('help.overview.title')}</h2>
                <p class="help-lead">${this.t('help.overview.description')}</p>
                <div class="help-diagram">
                    <div class="help-diagram-node" style="--node-color: #10b981"><i class="fas fa-sign-in-alt"></i>${this.t('help.overview.diagram_input')}</div>
                    <div class="help-diagram-arrow"></div>
                    <div class="help-diagram-node" style="--node-color: #6366f1"><i class="fas fa-exchange-alt"></i>${this.t('help.overview.diagram_cipher')}</div>
                    <div class="help-diagram-arrow"></div>
                    <div class="help-diagram-node" style="--node-color: #f59e0b"><i class="fas fa-sign-out-alt"></i>${this.t('help.overview.diagram_output')}</div>
                </div>
                <h3>${this.t('help.overview.features')}</h3>
                <div class="help-features">
                    ${feature('fa-puzzle-piece', 'help.overview.visual_programming', 'help.overview.visual_desc')}
                    ${feature('fa-link', 'help.overview.chain_encryption', 'help.overview.chain_desc')}
                    ${feature('fa-exchange-alt', 'help.overview.reverse_encryption', 'help.overview.reverse_desc')}
                </div>
            </section>`;
    }

    renderAlgorithms() {
        const groups = NodeRegistry.byCategory().map(group => `
            <h3 class="help-group-title">${this.t(group.label)}</h3>
            ${group.nodes.map(def => this.renderCard(def)).join('')}`).join('');
        return `
            <section class="help-section" data-section="algorithms">
                <h2>${this.t('help.algorithms.title')}</h2>
                ${groups}
            </section>`;
    }

    renderCard(def) {
        const help = def.help || {};
        const title = this.t(help.title || def.title);
        const blocks = (help.blocks || []).map(block => this.renderBlock(block)).join('');
        return `
            <article class="help-card" data-node-type="${def.type}" style="--node-color: ${def.color}">
                <header class="help-card-header">
                    <span class="help-card-icon"><i class="${def.icon}"></i></span>
                    <div><h4>${title}</h4>${help.desc ? `<p>${this.t(help.desc)}</p>` : ''}</div>
                </header>
                ${blocks}
            </article>`;
    }

    renderBlock(block) {
        switch (block.kind) {
            case 'principle':
                return `<p class="help-principle"><strong>${this.t('help.general.principle')}</strong> ${this.rich(block.text)}</p>`;
            case 'text':
                return `<p>${this.rich(block.text)}</p>`;
            case 'example':
                return `
                    <div class="help-example">
                        ${block.title ? `<h5>${this.t(block.title)}</h5>` : ''}
                        ${block.lines.map(([kind, key]) => this.renderLine(kind, key)).join('')}
                    </div>`;
            case 'note':
                return `
                    <div class="help-note">
                        ${block.title ? `<h5>${this.t(block.title)}</h5>` : ''}
                        ${block.lines.map(key => `<p>${this.rich(key)}</p>`).join('')}
                    </div>`;
            default:
                return '';
        }
    }

    renderLine(kind, key) {
        const text = this.rich(key);
        switch (kind) {
            case 'output': return `<div class="help-line help-line-output">${text}</div>`;
            case 'pre': return `<pre class="help-line">${text.replace(/<br>/g, '\n')}</pre>`;
            case 'pre-output': return `<pre class="help-line help-line-output">${text.replace(/<br>/g, '\n')}</pre>`;
            case 'text': return `<p>${text}</p>`;
            default: return `<div class="help-line">${text}</div>`;
        }
    }

    renderDataLoss() {
        const item = (type, issueKey, descKeys, exampleKeys) => {
            const def = NodeRegistry.get(type);
            return `
                <article class="help-card" style="--node-color: ${def.color}">
                    <header class="help-card-header">
                        <span class="help-card-icon"><i class="${def.icon}"></i></span>
                        <div><h4>${this.t(def.help?.title || def.title)}</h4><p>${this.t(issueKey)}</p></div>
                    </header>
                    <div class="help-note">${descKeys.map(k => `<p>${this.rich(k)}</p>`).join('')}</div>
                    ${exampleKeys.length ? `<div class="help-example">${exampleKeys.map(([kind, k]) => this.renderLine(kind, k)).join('')}</div>` : ''}
                </article>`;
        };
        return `
            <section class="help-section" data-section="data-loss">
                <h2>${this.t('help.dataloss.title')}</h2>
                <p class="help-lead">${this.rich('help.dataloss.intro')}</p>
                <div class="help-note">
                    <h5>${this.t('help.dataloss.general_loss_title')}</h5>
                    <p>${this.t('help.dataloss.general_loss_desc')}</p>
                </div>
                <h3 class="help-group-title">${this.t('help.dataloss.by_algo_subtitle')}</h3>
                ${item('morse', 'help.dataloss.morse.issue', ['help.dataloss.morse.desc', 'help.dataloss.morse.solution'], [['input', 'help.dataloss.morse.example_input'], ['output', 'help.dataloss.morse.example_output']])}
                ${item('a1z26', 'help.dataloss.a1z26.issue', ['help.dataloss.a1z26.desc1', 'help.dataloss.a1z26.desc2'], [['input', 'help.dataloss.a1z26.example1'], ['input', 'help.dataloss.a1z26.example2']])}
                ${item('numbers-to-words', 'help.dataloss.numbers.issue', ['help.dataloss.numbers.desc'], [['input', 'help.dataloss.numbers.example_input'], ['output', 'help.dataloss.numbers.example_output'], ['text', 'help.dataloss.numbers.example_conclusion']])}
                ${item('math', 'help.dataloss.math.issue', ['help.dataloss.math.desc'], [['input', 'help.dataloss.math.example_op'], ['output', 'help.dataloss.math.example_result']])}
                ${item('uwu-ifier', 'help.dataloss.uwu.issue', ['help.dataloss.uwu.desc'], [['input', 'help.dataloss.uwu.example_input'], ['text', 'help.dataloss.uwu.example_output']])}
                ${item('gawr-gura', 'help.dataloss.shark.issue', ['help.dataloss.shark.desc'], [['input', 'help.dataloss.shark.example_input'], ['output', 'help.dataloss.shark.example_output']])}
                ${item('stream-merger', 'help.dataloss.merger.issue', ['help.dataloss.merger.desc'], [['input', 'help.dataloss.merger.example_input_a'], ['input', 'help.dataloss.merger.example_input_b'], ['output', 'help.dataloss.merger.example_output']])}
                ${item('multi-replacer', 'help.dataloss.replace.issue', ['help.dataloss.replace.desc'], [['input', 'help.dataloss.replace.example_rules'], ['input', 'help.dataloss.replace.example_input'], ['text', 'help.dataloss.replace.example_conclusion']])}
            </section>`;
    }

    renderExamples() {
        const EXAMPLES = [
            ['simple-caesar', 'fa-play', 'help.examples.basic_encryption'],
            ['multilevel-encryption', 'fa-layer-group', 'help.examples.multilevel'],
            ['vigenere-with-secret', 'fa-key', 'help.examples.vigenere'],
            ['planet-enchanter', 'fa-globe', 'help.examples.geo'],
            ['cat-morse', 'fa-cat', 'help.examples.fun'],
            ['monitoring-chain', 'fa-desktop', 'help.examples.debug'],
        ];
        const cards = EXAMPLES.map(([key, icon, prefix]) => {
            const def = EXAMPLE_SCHEMES[key];
            const color = NodeRegistry.get(def.nodes.find(n => !['input', 'output'].includes(n.type))?.type || 'caesar').color;
            return `
                <article class="help-card" style="--node-color: ${color}">
                    <header class="help-card-header">
                        <span class="help-card-icon"><i class="fas ${icon}"></i></span>
                        <div><h4>${this.t(`${prefix}.title`)}</h4><p>${this.t(`${prefix}.desc`)}</p></div>
                    </header>
                    <div class="help-example">
                        <h5>${this.t(`${prefix}.scheme_title`)}</h5>
                        <div class="help-line">${this.rich(`${prefix}.scheme_desc`)}</div>
                        <div class="help-line help-line-output">${this.rich(`${prefix}.scheme_result`)}</div>
                    </div>
                    ${this.has(`${prefix}.tip`) ? `<p class="help-tip">${this.t(`${prefix}.tip`)}</p>` : ''}
                    <button class="btn btn-primary" data-example="${key}"><i class="fas fa-download"></i> ${this.t('help.examples.load_button')}</button>
                </article>`;
        }).join('');
        return `
            <section class="help-section" data-section="examples">
                <h2>${this.t('help.examples.usage_title')}</h2>
                ${cards}
            </section>`;
    }

    renderHotkeys() {
        const groups = [
            ['help.hotkeys.file_management', [['hotkey.save', 'help.hotkeys.save_desc'], ['hotkey.load', 'help.hotkeys.load_desc'], ['hotkey.new', 'help.hotkeys.new_desc']]],
            ['help.hotkeys.node_management', [['hotkey.copy', 'help.hotkeys.copy_desc'], ['hotkey.paste', 'help.hotkeys.paste_desc'], ['hotkey.select_all', 'help.hotkeys.select_all_desc'], ['hotkey.delete', 'help.hotkeys.delete_desc']]],
            ['help.hotkeys.history', [['hotkey.undo', 'help.hotkeys.undo_desc'], ['hotkey.redo', 'help.hotkeys.redo_desc']]],
            ['help.hotkeys.canvas_management', [['hotkey.zoom_in', 'help.hotkeys.zoom_in_desc'], ['hotkey.zoom_out', 'help.hotkeys.zoom_out_desc'], ['hotkey.zoom_reset', 'help.hotkeys.zoom_reset_desc'], ['hotkey.cut_mode', 'help.hotkeys.cut_mode_desc']]],
            ['help.hotkeys.general_commands', [['hotkey.help', 'help.hotkeys.help_desc'], ['hotkey.escape', 'help.hotkeys.escape_desc']]],
            ['help.hotkeys.additional', [['help.hotkeys.insert_title', 'help.hotkeys.insert'], ['help.hotkeys.palette_tap_title', 'help.hotkeys.palette_tap'], ['help.hotkeys.break_connection_title', 'help.hotkeys.break_connection'], ['help.hotkeys.zoom_wheel_title', 'help.hotkeys.zoom_wheel'], ['help.hotkeys.pan_title', 'help.hotkeys.pan'], ['help.hotkeys.touch_title', 'help.hotkeys.touch']]],
        ];
        return `
            <section class="help-section" data-section="hotkeys">
                <h2>${this.t('help.hotkeys.title')}</h2>
                <p class="help-lead">${this.t('help.hotkeys.intro')}</p>
                ${groups.map(([titleKey, rows]) => `
                    <h3 class="help-group-title">${this.t(titleKey)}</h3>
                    <table class="hotkey-table">
                        ${rows.map(([keyKey, descKey]) => `<tr><td><kbd>${this.t(keyKey)}</kbd></td><td>${this.t(descKey)}</td></tr>`).join('')}
                    </table>`).join('')}
            </section>`;
    }
}
