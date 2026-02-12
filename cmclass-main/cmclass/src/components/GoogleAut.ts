import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

declare global {
  interface Window {
    google?: any;
  }
}

let googleScriptPromise: Promise<void> | null = null;

const loadGoogleScript = () => {
  if (googleScriptPromise) return googleScriptPromise;
  googleScriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google script")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(script);
  });
  return googleScriptPromise;
};

type UseGoogleOAuthOptions = {
  remember?: boolean;
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export function useGoogleOAuth(options: UseGoogleOAuthOptions = {}) {
  const { oauthLogin } = useAuth();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const [ready, setReady] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    if (!clientId || initRef.current) return;

    loadGoogleScript()
      .then(() => {
        if (!mounted || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: { credential?: string }) => {
            if (!response?.credential) {
              options.onError?.("Google authentication failed.");
              return;
            }
            try {
              await oauthLogin({
                provider: "google",
                token: response.credential,
                remember: options.remember ?? true,
              });
              options.onSuccess?.();
            } catch (err: any) {
              options.onError?.(err?.message || "Google authentication failed.");
            }
          },
        });
        initRef.current = true;
        setReady(true);
      })
      .catch((err) => {
        if (!mounted) return;
        options.onError?.(err?.message || "Failed to load Google Sign-In.");
      });

    return () => {
      mounted = false;
    };
  }, [clientId, oauthLogin, options]);

  const redirectToGoogle = useCallback(() => {
    if (!clientId) {
      options.onError?.("Google Sign-In indisponible (client ID manquant).");
      return;
    }
    if (!window.google?.accounts?.id) {
      options.onError?.("Google Sign-In n'est pas prêt.");
      return;
    }
    window.google.accounts.id.prompt();
  }, [clientId, options]);

  return { redirectToGoogle, ready };
}
