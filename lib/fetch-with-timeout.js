const SUPABASE_REQUEST_TIMEOUT_MS = 15_000;

export async function fetchWithTimeout(input, init = {}) {
    const controller = new AbortController();
    const requestSignal = init.signal;
    const abortFromRequest = () => controller.abort(requestSignal.reason);

    if (requestSignal?.aborted) {
        abortFromRequest();
    } else {
        requestSignal?.addEventListener('abort', abortFromRequest, { once: true });
    }

    const timeoutId = setTimeout(
        () => controller.abort(new Error('Supabase request timed out.')),
        SUPABASE_REQUEST_TIMEOUT_MS
    );

    try {
        return await fetch(input, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timeoutId);
        requestSignal?.removeEventListener('abort', abortFromRequest);
    }
}
