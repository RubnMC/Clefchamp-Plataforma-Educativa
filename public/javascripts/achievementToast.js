function showAchievementToast(logro) {
    const container = document.getElementById('achievementToastContainer');
    if (!container) return;

    const toastEl = document.createElement('div');
    toastEl.className = 'toast achievement-toast align-items-center border-0';
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body d-flex align-items-center gap-3">
                <img src="/images/achievements/${logro.imagen}" alt="${logro.nombre}" class="achievement-toast-img">
                <div>
                    <small class="achievement-toast-label">¡Logro desbloqueado!</small>
                    <div class="achievement-toast-name">${logro.nombre}</div>
                </div>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
        </div>
    `;

    container.appendChild(toastEl);
    const bsToast = new bootstrap.Toast(toastEl, { delay: 5000 });
    bsToast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}
