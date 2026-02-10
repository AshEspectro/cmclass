export default function Accessibilite() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 py-16 space-y-8">
      <h1 className="text-3xl font-semibold">Accessibilite</h1>
      <p className="text-gray-600">
        Nous visons une experience inclusive pour tous les utilisateurs, quels que soient leurs appareils ou
        besoins.
      </p>

      <section className="space-y-2 text-gray-700">
        <h2 className="font-semibold text-lg">Principes appliques</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Contrastes colores verifies pour les textes et boutons.</li>
          <li>Navigation clavier et focus visible sur les elements interactifs.</li>
          <li>Texte alternatif sur les visuels essentiels.</li>
          <li>Formulaires etiquetes et messages d erreur explicites.</li>
        </ul>
      </section>

      <section className="space-y-2 text-gray-700">
        <h2 className="font-semibold text-lg">Limitations connues</h2>
        <p>Certains contenus video n ont pas encore de sous-titres. Nous travaillons a les ajouter.</p>
      </section>

      <section className="space-y-2 text-gray-700">
        <h2 className="font-semibold text-lg">Signaler un probleme</h2>
        <p>
          Ecrivez-nous a contact@cmclass.cd pour toute difficulte d acces. Indiquez la page concernee et votre
          navigateur pour nous aider a corriger rapidement.
        </p>
      </section>
    </div>
  );
}
