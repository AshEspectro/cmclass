const sections = [
  {
    title: 'Univers',
    links: [
      { label: 'Nouveautes', href: '/nouveautes' },
      { label: 'Homme', href: '/homme' },
      { label: 'Femme', href: '/femme' },
      { label: 'Accessoires', href: '/accessoires' },
      { label: 'Collections capsule', href: '/stories' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Prendre rendez-vous', href: '/contact' },
      { label: 'Creation sur mesure', href: '/contact' },
      { label: 'Retouches & ajustements', href: '/contact' },
      { label: 'Personnalisation', href: '/contact' },
      { label: 'Emballages cadeaux', href: '/contact' },
    ],
  },
  {
    title: 'Aide & Support',
    links: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Suivi de commande', href: '/suivi' },
      { label: 'Retours & echanges', href: '/retours' },
      { label: "Guide des tailles", href: '/tailles' },
      { label: "Conseils d'entretien", href: '/entretien' },
      { label: 'Contact 7j/7', href: '/contact' },
    ],
  },
  {
    title: 'La Maison',
    links: [
      { label: 'Notre histoire', href: '/notre-histoire' },
      { label: "L'atelier & savoir-faire", href: '/atelier' },
      { label: 'Engagement qualite', href: '/engagement' },
      { label: 'Durabilite', href: '/developpement-durable' },
      { label: 'Presse & collaborations', href: '/collaborations' },
      { label: 'Carriere', href: '/carriere' },
    ],
  },
  {
    title: 'Informations legales',
    links: [
      { label: 'Mentions legales', href: '/mentions-legales' },
      { label: 'Accessibilite', href: '/accessibilite' },
      { label: 'Cookies', href: '/cookies' },
      { label: 'Plan du site', href: '/plan-du-site' },
    ],
  },
];

export default function PlanDuSite() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 py-16 space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Plan du site</h1>
        <p className="text-gray-600">
          Acces rapide aux principales rubriques de la maison CM CLASS.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sections.map((section) => (
          <div key={section.title} className="border border-gray-200 rounded-xl p-5 space-y-3">
            <h2 className="font-semibold text-lg">{section.title}</h2>
            <ul className="space-y-2 text-gray-700">
              {section.links.map((link) => (
                <li key={link.href}>
                  <a className="hover:text-[#007B8A]" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
