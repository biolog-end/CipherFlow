/**
 * The bottom text panel. In encrypt mode the left box is editable and the right shows the result;
 * decrypt mode swaps the roles.
 * Gigantic results are shown truncated (laying out tens of megabytes in a textarea freezes the
 * browser for seconds); the full text stays available through "copy all" / "download".
 */
class IoPanel {
    /** Longest result placed into the textarea itself. */
    static DISPLAY_LIMIT = 1000000;

    constructor(app) {
        this.app = app;
        this.input = document.getElementById('inputText');
        this.output = document.getElementById('outputText');
        this.inputLabel = document.getElementById('inputLabel');
        this.outputLabel = document.getElementById('outputLabel');
        this.inputSection = document.getElementById('inputSection');
        this.outputSection = document.getElementById('outputSection');
        this.reverse = false;
        this.fullResult = '';
        this.tabs = this.createTabs();

        this.input.addEventListener('input', () => { if (!this.reverse) this.app.execute(); });
        this.output.addEventListener('input', () => { if (this.reverse) this.app.execute(); });
        for (const section of [this.inputSection, this.outputSection]) {
            section.querySelector('.io-copy-full').addEventListener('click', () => this.copyFull());
            section.querySelector('.io-download-full').addEventListener('click', () => this.downloadFull());
        }
        i18n.onLanguageChange(() => this.applyMode(this.reverse));
        this.applyMode(false);
    }

    applyMode(reverse) {
        this.reverse = reverse;
        this.input.readOnly = reverse;
        this.output.readOnly = !reverse;
        this.input.placeholder = i18n.t(reverse ? 'io.decrypted_placeholder' : 'io.input_placeholder');
        this.output.placeholder = i18n.t(reverse ? 'io.encrypted_placeholder' : 'io.output_placeholder');
        this.inputLabel.textContent = i18n.t(reverse ? 'io.decrypted_label' : 'io.input_label');
        this.outputLabel.textContent = i18n.t(reverse ? 'io.encrypted_label' : 'io.output_label');
        this.inputSection.classList.toggle('is-result', reverse);
        this.outputSection.classList.toggle('is-source', reverse);
        this.tabs.input.textContent = this.inputLabel.textContent;
        this.tabs.output.textContent = this.outputLabel.textContent;
        this.setTab(reverse ? this.outputSection : this.inputSection);
        for (const section of [this.inputSection, this.outputSection]) {
            section.querySelector('.io-copy-full').textContent = i18n.t('io.copy_full');
            section.querySelector('.io-download-full').textContent = i18n.t('io.download_full');
        }
        this.updateNotices();
    }

    /* ---------- narrow screens: one section at a time ---------- */

    createTabs() {
        const strip = document.createElement('div');
        strip.className = 'io-tabs';
        const make = (section) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.addEventListener('click', () => this.setTab(section));
            strip.appendChild(button);
            return button;
        };
        const tabs = { input: make(this.inputSection), output: make(this.outputSection) };
        this.inputSection.parentElement.prepend(strip);
        return tabs;
    }

    setTab(section) {
        this.inputSection.classList.toggle('is-active', section === this.inputSection);
        this.outputSection.classList.toggle('is-active', section === this.outputSection);
        this.tabs.input.classList.toggle('active', section === this.inputSection);
        this.tabs.output.classList.toggle('active', section === this.outputSection);
    }

    get resultSection() {
        return this.reverse ? this.inputSection : this.outputSection;
    }

    /** Text entering the graph in the current mode. */
    get sourceText() {
        return this.reverse ? this.output.value : this.input.value;
    }

    set resultText(value) {
        const target = this.reverse ? this.input : this.output;
        this.fullResult = value;
        const shown = value.length > IoPanel.DISPLAY_LIMIT ? value.slice(0, IoPanel.DISPLAY_LIMIT) : value;
        if (target.value !== shown) target.value = shown;
        this.updateNotices();
    }

    updateNotices() {
        for (const section of [this.inputSection, this.outputSection]) {
            const notice = section.querySelector('.io-notice');
            const truncated = section === this.resultSection && this.fullResult.length > IoPanel.DISPLAY_LIMIT;
            notice.hidden = !truncated;
            if (truncated) {
                notice.querySelector('span').textContent = i18n.t('io.truncated', {
                    shown: ChainExecutor.formatLength(IoPanel.DISPLAY_LIMIT),
                    total: ChainExecutor.formatLength(this.fullResult.length),
                });
            }
        }
    }

    async copyFull() {
        try {
            await navigator.clipboard.writeText(this.fullResult);
            UI.notify(i18n.t('notification.result_copied'), 'success');
        } catch {
            UI.notify(i18n.t('error.copy_failed'), 'error');
        }
    }

    downloadFull() {
        const blob = new Blob([this.fullResult], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `cipherflow-result-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
    }

    clear() {
        this.input.value = '';
        this.output.value = '';
        this.fullResult = '';
        this.updateNotices();
    }
}
