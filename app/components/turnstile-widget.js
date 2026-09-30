'use client';

import { useEffect, useRef } from 'react';

export default function TurnstileWidget() {
    const containerRef = useRef(null);
    const tokenRef = useRef(null);
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    useEffect(() => {
        if (!siteKey || !containerRef.current) return undefined;

        let widgetId;
        let script = document.getElementById('cloudflare-turnstile-script');

        const renderWidget = () => {
            if (!window.turnstile || !containerRef.current || widgetId !== undefined) return;

            widgetId = window.turnstile.render(containerRef.current, {
                sitekey: siteKey,
                callback: (token) => {
                    tokenRef.current.value = token;
                    tokenRef.current.dataset.widgetId = String(widgetId);
                },
                'expired-callback': () => {
                    tokenRef.current.value = '';
                },
                'error-callback': () => {
                    tokenRef.current.value = '';
                },
            });
        };

        if (window.turnstile) {
            renderWidget();
        } else {
            if (!script) {
                script = document.createElement('script');
                script.id = 'cloudflare-turnstile-script';
                script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            }
            script.addEventListener('load', renderWidget);
        }

        return () => {
            script?.removeEventListener('load', renderWidget);
            if (widgetId !== undefined) window.turnstile?.remove(widgetId);
        };
    }, [siteKey]);

    if (!siteKey) return null;

    return (
        <div className="auth-captcha">
            <div ref={containerRef} />
            <input ref={tokenRef} type="hidden" name="captchaToken" defaultValue="" />
        </div>
    );
}