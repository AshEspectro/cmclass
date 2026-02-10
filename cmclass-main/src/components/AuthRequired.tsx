import { Link } from "react-router-dom";

interface AuthRequiredProps {
  title?: string;
  description?: string;
  className?: string;
  onAction?: () => void;
}

export const AuthRequired = ({
  title = "Connectez-vous pour continuer",
  description = "Créez un compte ou connectez-vous pour accéder à cette fonctionnalité.",
  className = "",
  onAction,
}: AuthRequiredProps) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 text-center ${className}`}>
      <h2 className="text-lg font-medium mb-2">{title}</h2>
      <p className="text-sm text-gray-600 mb-6">{description}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/login"
          onClick={onAction}
          className="px-6 py-3 rounded-full text-sm bg-black text-white hover:bg-gray-900 transition"
        >
          Se connecter
        </Link>
        <Link
          to="/compte"
          onClick={onAction}
          className="px-6 py-3 rounded-full text-sm border border-black text-black hover:bg-black hover:text-white transition"
        >
          Créer un compte
        </Link>
      </div>
    </div>
  );
};
