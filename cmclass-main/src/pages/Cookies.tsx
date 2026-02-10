export default function Cookies() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 py-16 space-y-8">
      <h1 className="text-3xl font-semibold">Gestion des cookies</h1>
      <p className="text-gray-600">
        Nous utilisons des cookies pour assurer le bon fonctionnement du site et ameliorer votre experience.
      </p>

      <section className="space-y-2 text-gray-700">
        <h2 className="font-semibold text-lg">Types de cookies</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Necessaires :</strong> authentification, panier, preference de langue.</li>
          <li><strong>Mesure d audience :</strong> statistiques anonymisees pour ameliorer le parcours.</li>
          <li><strong>Personnalisation :</strong> recommandations basees sur votre navigation.</li>
        </ul>
      </section>

      <section className="space-y-2 text-gray-700">
        <h2 className="font-semibold text-lg">Vos choix</h2>
        <p>
          Vous pouvez effacer ou desactiver les cookies via les reglages de votre navigateur. Les cookies
          necessaires restent indispensables au fonctionnement.
        </p>
      </section>
    </div>
  );
}
