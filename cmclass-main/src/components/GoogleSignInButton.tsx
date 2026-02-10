import { useEffect, useRef, useState } from "react";

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

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => void | Promise<void>;
  onError?: (message: string) => void;
  className?: string;
  text?: "signin_with" | "signup_with" | "continue_with";
}

export const GoogleSignInButton = ({
  onCredential,
  onError,
  className,
  text = "signin_with",
}: GoogleSignInButtonProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    let mounted = true;
    if (!clientId || !containerRef.current) return;
    loadGoogleScript()
      .then(() => {
        if (!mounted || !containerRef.current || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential?: string }) => {
            if (response?.credential) {
              onCredential(response.credential);
            } else {
              onError?.("Google authentication failed.");
            }
          },
        });
        const width = containerRef.current.offsetWidth || 320;
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          text,
          shape: "pill",
          width,
        });
        setReady(true);
      })
      .catch((err) => {
        if (!mounted) return;
        onError?.(err?.message || "Failed to load Google Sign-In.");
      });
    return () => {
      mounted = false;
    };
  }, [clientId, onCredential, onError, text]);

  if (!clientId) {
    return (
      <button
        type="button"
        className={className}
        disabled
      >
        Google Sign-In indisponible
      </button>
    );
  }

  return (
    <div className={`w-full flex flex-col items-center justify-center ${className || ""}`}>
      <div ref={containerRef} className="w-full flex justify-center" />
      {!ready && <div className="text-xs text-gray-400 mt-2">Chargement Google…</div>}
    </div>
  );
};
