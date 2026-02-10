const faqs = [
  {
    q: 'Comment suivre ma commande ?',
    a: 'Connectez-vous puis consultez la page Suivi de commande pour voir le statut en temps reel.',
  },
  {
    q: 'Quels sont les delais de livraison ?',
    a: 'La livraison standard prend 3 a 7 jours ouvrables selon votre zone. Les delais exacts sont indiques au checkout.',
  },
  {
    q: 'Puis-je retourner un article ?',
    a: 'Oui, dans le delai mentionne dans nos conditions. Utilisez la rubrique Retours & echanges ou contactez-nous.',
  },
  {
    q: 'Proposez-vous du sur-mesure ?',
    a: 'Oui, via nos services Creation sur mesure. Prenez rendez-vous depuis la page Contact.',
  },
  {
    q: 'Quels moyens de paiement acceptez-vous ?',
    a: 'Cartes bancaires principales et solutions locales disponibles au moment du paiement.',
  },
  {
    q: 'Comment entretenir mes pieces ?',
    a: "Consultez la page Conseils d'entretien ou l etiquette du vetement. Beaucoup de nos pieces demandent un nettoyage a sec.",
  },
];

export default function FAQ() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 py-16 space-y-8">
      <h1 className="text-2xl font-semibold">FAQ</h1>
      <div className="space-y-4">
        {faqs.map((item, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4">
            <h2 className="font-medium text-lg">{item.q}</h2>
            <p className="text-gray-700 mt-2">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
