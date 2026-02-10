const steps = [
  'Ouvrez votre compte depuis l icone profil.',
  'Accedez a la rubrique Mes commandes.',
  'Consultez le statut, les articles et les informations de livraison.',
];

const statuses = [
  { label: 'Pending', desc: 'Commande enregistree, en attente de traitement.' },
  { label: 'Processing', desc: 'Preparation en cours dans notre atelier.' },
  { label: 'Shipped', desc: 'Expediee, avec numero de suivi disponible.' },
  { label: 'Delivered', desc: 'Livree a votre adresse.' },
  { label: 'Cancelled', desc: 'Commande annulee a votre demande ou apres echec de paiement.' },
];

export default function SuiviCommande() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 py-16 space-y-8">
      <h1 className="text-3xl font-semibold">Suivi de commande</h1>
      <p className="text-gray-600">
        Connectez-vous pour suivre chaque etape de votre commande et retrouver vos informations de livraison.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-lg">Comment proceder</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            {steps.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ol>
        </div>

        <div className="border border-gray-200 rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-lg">Statuts possibles</h2>
          <ul className="space-y-2 text-gray-700">
            {statuses.map((s) => (
              <li key={s.label}>
                <span className="font-medium">{s.label} :</span> {s.desc}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl p-5 space-y-3 text-gray-700">
        <h2 className="font-semibold text-lg">Besoin d aide ?</h2>
        <p>Notre service client est disponible 7j/7 via le formulaire de contact ou par telephone.</p>
        <a href="/contact" className="text-[#007B8A] font-medium hover:underline">
          Acceder au contact
        </a>
      </div>
    </div>
  );
}
