import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("pwa-dismissed");
    if (dismissed) return;

    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    const standalone = window.navigator.standalone === true;

    if (ios && !standalone) {
      setIsIos(true);
      setShowBanner(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("pwa-dismissed", "1");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm bg-surface-900 text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
        <Download size={16} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">Instalar PWAmecanico</p>
        {isIos ? (
          <p className="text-xs text-surface-400 mt-0.5">
            Toca <strong>Compartir</strong> → <strong>Agregar a inicio</strong>
          </p>
        ) : (
          <p className="text-xs text-surface-400 mt-0.5">Accede rápido desde tu pantalla de inicio</p>
        )}
      </div>
      {!isIos && (
        <button
          onClick={handleInstall}
          className="flex-shrink-0 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          Instalar
        </button>
      )}
      <button onClick={handleDismiss} className="flex-shrink-0 text-surface-400 hover:text-white transition-colors">
        <X size={16} />
      </button>
    </div>
  );
}
