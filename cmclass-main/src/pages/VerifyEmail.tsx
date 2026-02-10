import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Vérification en cours...");
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    (async () => {
      if (!token) {
        if (!active) return;
        setStatus("error");
        setMessage("Lien de vérification invalide.");
        return;
      }
      try {
        await verifyEmail(token);
        if (!active) return;
        setStatus("success");
        setMessage("Adresse e-mail vérifiée. Vous êtes connecté.");
        setTimeout(() => navigate("/home"), 1200);
      } catch (err: any) {
        if (!active) return;
        setStatus("error");
        setMessage(err?.message || "Échec de la vérification.");
      }
    })();
    return () => {
      active = false;
    };
  }, [token, verifyEmail, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center border border-gray-200 rounded-xl p-8">
        <h1 className="text-lg font-medium mb-3">Vérification de l’e-mail</h1>
        <p className={`text-sm ${status === "error" ? "text-red-600" : "text-gray-600"}`}>
          {message}
        </p>
      </div>
    </div>
  );
}
