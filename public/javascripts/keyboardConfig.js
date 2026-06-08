const DEFAULT_NOTES = [
    { key: 'a', note: 'c' },
    { key: 's', note: 'd' },
    { key: 'd', note: 'e' },
    { key: 'f', note: 'f' },
    { key: 'j', note: 'g' },
    { key: 'k', note: 'a' },
    { key: 'l', note: 'b' }
];

const IGNORED_KEYS = new Set(['Tab', 'Escape', 'Enter', 'Shift', 'Control', 'Alt', 'Meta',
    'CapsLock', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Delete']);

async function loadConfig() {
    if (!window.isTrial) {
        try {
            const res = await fetch('/users/keyboardConfig');
            const data = await res.json();
            if (data.config) return data.config;
        } catch {}
    }
    try {
        const local = localStorage.getItem('keyboardConfig');
        if (local) return JSON.parse(local);
    } catch {}
    return DEFAULT_NOTES;
}

function populateModal(notes) {
    document.querySelectorAll('#keyboardConfigModal [data-note]').forEach(row => {
        const note = row.dataset.note;
        const entry = notes.find(n => n.note === note);
        const input = row.querySelector('input.key-capture');
        if (entry && input) {
            input.value = entry.key.toUpperCase();
            input.dataset.key = entry.key.toLowerCase();
        }
    });
}

function validateDuplicates() {
    const inputs = document.querySelectorAll('#keyboardConfigModal input.key-capture');
    const keys = Array.from(inputs).map(i => i.dataset.key).filter(Boolean);
    const hasDupes = new Set(keys).size !== keys.length;
    document.getElementById('kbConfigError').classList.toggle('d-none', !hasDupes);
    document.getElementById('kbConfigSaveBtn').disabled = hasDupes;
}

function getNotesFromModal() {
    const notes = [];
    document.querySelectorAll('#keyboardConfigModal [data-note]').forEach(row => {
        const input = row.querySelector('input.key-capture');
        notes.push({ key: input.dataset.key || input.value.toLowerCase(), note: row.dataset.note });
    });
    return notes;
}

async function saveConfig(notes) {
    if (!window.isTrial) {
        try {
            const res = await fetch('/users/keyboardConfig', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes })
            });
            const data = await res.json();
            if (!data.ok) { alert(data.error || 'Error al guardar'); return; }
        } catch { alert('Error de conexión'); return; }
    } else {
        localStorage.setItem('keyboardConfig', JSON.stringify(notes));
    }
    window.applyKeyboardConfig(notes);
    bootstrap.Modal.getInstance(document.getElementById('keyboardConfigModal'))?.hide();
}

window.applyKeyboardConfig = function(notes) {
    if (typeof GameState !== 'undefined') {
        GameState.keyMapping.notes = notes;
        GameState.keyMapping.keyMap = Object.fromEntries(notes.map(({ key, note }) => [key, note]));
        GameState.keyMapping.visualKeyMap = Object.fromEntries(notes.map(({ key, note }) => [key, `.note${note}`]));
    }
    notes.forEach(({ key, note }) => {
        const btn = document.querySelector(`.tecla-guia.note${note}`);
        if (btn) btn.textContent = key.toUpperCase();
    });
};

window.openKeyboardConfigModal = async function() {
    const notes = await loadConfig();
    populateModal(notes);
    validateDuplicates();
    new bootstrap.Modal(document.getElementById('keyboardConfigModal')).show();
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('keyboardConfigModal')?.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (document.activeElement?.classList.contains('key-capture')) {
            e.preventDefault();
            if (IGNORED_KEYS.has(e.key)) return;
            const input = document.activeElement;
            input.value = e.key.toUpperCase();
            input.dataset.key = e.key.toLowerCase();
            validateDuplicates();
        }
    });

    document.getElementById('kbConfigSaveBtn')?.addEventListener('click', () => {
        saveConfig(getNotesFromModal());
    });

    document.getElementById('kbConfigResetBtn')?.addEventListener('click', () => {
        populateModal(DEFAULT_NOTES);
        validateDuplicates();
    });
});
