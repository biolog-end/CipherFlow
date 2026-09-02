/**
 * Small shared UI primitives: toast notifications, confirm dialogs, the undo/redo indicator.
 * Replaces native alert()/confirm() so the app never blocks the page.
 */
const UI = (() => {
    const t = (key, params) => i18n.t(key, params);

    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    let toastStack = null;

    function notify(message, type = 'info', duration = 4000) {
        if (!toastStack) {
            toastStack = document.createElement('div');
            toastStack.className = 'toast-stack';
            document.body.appendChild(toastStack);
        }
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icon = { success: 'fa-check', error: 'fa-exclamation-triangle', info: 'fa-info-circle' }[type] || 'fa-info-circle';
        toast.innerHTML = `<i class="fas ${icon}"></i><span></span>`;
        toast.querySelector('span').textContent = message;
        toastStack.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));

        const remove = () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 200);
        };
        const timer = setTimeout(remove, duration);
        toast.addEventListener('click', () => { clearTimeout(timer); remove(); });
        return toast;
    }

    /**
     * Modal confirm. Resolves true when the primary button is pressed.
     * @param {{ title?: string, message: string, confirmLabel?: string, cancelLabel?: string, danger?: boolean }} options
     */
    function confirm(options) {
        return new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal modal-small" role="dialog" aria-modal="true">
                    ${options.title ? `<div class="modal-header"><h3>${escapeHtml(options.title)}</h3></div>` : ''}
                    <div class="modal-body"><p>${escapeHtml(options.message).replace(/\n/g, '<br>')}</p></div>
                    <div class="modal-footer">
                        <button class="btn" data-action="cancel">${escapeHtml(options.cancelLabel || t('dialog.cancel'))}</button>
                        <button class="btn ${options.danger ? 'btn-danger' : 'btn-primary'}" data-action="confirm">${escapeHtml(options.confirmLabel || t('dialog.yes'))}</button>
                    </div>
                </div>`;
            const close = (result) => {
                overlay.classList.remove('show');
                document.removeEventListener('keydown', onKey);
                setTimeout(() => overlay.remove(), 150);
                resolve(result);
            };
            const onKey = (e) => {
                if (e.key === 'Escape') close(false);
                if (e.key === 'Enter') close(true);
            };
            overlay.querySelector('[data-action="cancel"]').onclick = () => close(false);
            overlay.querySelector('[data-action="confirm"]').onclick = () => close(true);
            overlay.onclick = (e) => { if (e.target === overlay) close(false); };
            document.addEventListener('keydown', onKey);
            document.body.appendChild(overlay);
            requestAnimationFrame(() => {
                overlay.classList.add('show');
                overlay.querySelector('[data-action="confirm"]').focus();
            });
        });
    }

    /**
     * Generic modal shell. Returns { overlay, body, close }.
     * @param {{ title: string, icon?: string, className?: string, bodyHtml: string, footerHtml?: string }} options
     */
    function modal(options) {
        const overlay = document.createElement('div');
        overlay.className = `modal-overlay ${options.className || ''}`;
        overlay.innerHTML = `
            <div class="modal" role="dialog" aria-modal="true">
                <div class="modal-header">
                    <h3>${options.icon ? `<i class="${options.icon}"></i>` : ''}<span class="modal-title">${escapeHtml(options.title)}</span></h3>
                    <button class="icon-btn modal-close" aria-label="close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">${options.bodyHtml}</div>
                ${options.footerHtml ? `<div class="modal-footer">${options.footerHtml}</div>` : ''}
            </div>`;
        const close = () => {
            overlay.classList.remove('show');
            document.removeEventListener('keydown', onKey);
            setTimeout(() => overlay.remove(), 150);
            if (options.onClose) options.onClose();
        };
        const onKey = (e) => { if (e.key === 'Escape') close(); };
        overlay.querySelector('.modal-close').onclick = close;
        overlay.onclick = (e) => { if (e.target === overlay) close(); };
        document.addEventListener('keydown', onKey);
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('show'));
        return { overlay, body: overlay.querySelector('.modal-body'), close };
    }

    let indicatorTimer = null;

    /** Short-lived status pill used for undo/redo and clipboard feedback. */
    function indicator(message, type = 'info') {
        let el = document.querySelector('.status-indicator');
        if (!el) {
            el = document.createElement('div');
            el.className = 'status-indicator';
            document.body.appendChild(el);
        }
        el.textContent = message;
        el.className = `status-indicator show ${type === 'error' ? 'is-error' : ''}`;
        clearTimeout(indicatorTimer);
        indicatorTimer = setTimeout(() => el.classList.remove('show'), 1800);
    }

    /** Pressing on the canvas moves keyboard focus away from text fields so shortcuts reach the workspace. */
    function blurTextControl() {
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) active.blur();
    }

    return Object.freeze({ escapeHtml, notify, confirm, modal, indicator, blurTextControl });
})();
