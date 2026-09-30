export function isTurnstileEnabled() {
    return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export function getTurnstileToken(form) {
    return form.elements.namedItem('captchaToken')?.value?.trim() || '';
}

export function resetTurnstile(form) {
    const tokenInput = form.elements.namedItem('captchaToken');
    const widgetId = tokenInput?.dataset.widgetId;
    tokenInput.value = '';

    if (widgetId && typeof window !== 'undefined') {
        window.turnstile?.reset(widgetId);
    }
}