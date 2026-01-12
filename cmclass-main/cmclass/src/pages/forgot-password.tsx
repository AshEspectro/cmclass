import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPwd() {
  const [email, setEmail] = useState("");

  const Info = () => (
    <div className="bg-gray-50 border border-none px-8 py-10 w-full max-w-lg mx-auto">
      <p className="font-regular text-xs tracking-wider uppercase text-gray-700 mb-6">
        Ce que vous trouverez dans votre compte
      </p>

      <ul className="space-y-6 text-gray-700 text-sm leading-relaxed">
        <li>Suivez vos commandes, réparations et accédez à vos factures.</li>
        <li className="pt-6 border-t border-gray-300">Gérez vos informations personnelles.</li>
        <li className="pt-6 border-t border-gray-300">Recevez des emails de Louis Vuitton.</li>
        <li className="pt-6 border-t border-gray-300">Créez votre wishlist, explorez des looks et partagez.</li>
      </ul>
    </div>
  );

  return (
    <div className="w-full bg-white py-16 px-6 md:px-12 lg:px-20 flex justify-center">
      <div className="w-full max-w-7xl mt-24 my-0 md:my-32 grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* SECTION GAUCHE */}
        <main className="col-span-1 md:col-span-2 w-full md:max-w-3xl">
          
          {/* Bouton retour */}
          <Link to="/login">
            <button className="text-sm text-gray-600 hover:underline mb-6">&larr; Se connecter</button>
          </Link>

          {/* Titre */}
          <h1 className="text-xl font-semibold mb-3 tracking-tight">Changez votre mot de passe</h1>

          <p className="text-sm text-gray-700 mb-10 w-[90%]">
            Pour réinitialiser votre mot de passe, veuillez nous fournir votre adresse e-mail. Nous vous enverrons un message dans quelques instants.
Pour toute aide supplémentaire, veuillez contacter le Service Clients.</p>

          {/* FORMULAIRE */}
          <form className="space-y-8">

            {/* Champ email */}
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="Entrez votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 rounded-md focus:outline-none focus:border-black text-sm"
              />
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center md:items-end mt-auto">
              <button
                type="submit"
                className="bg-black text-white py-3 w-xs rounded-3xl text-sm tracking-wide hover:bg-gray-800 transition"
              >
                Envoyer
              </button>

              {/* Lien créer un compte */}
              <div className="flex flex-col mt-8 text-center w-xs pr-0 md:pr-36 md:text-start">
                <p className="font-medium text-sm">Vous n'avez pas de compte ?</p>
                <Link 
                  to="/compte" 
                  className="underline text-sm hover:text-black w-fit self-center md:self-start"
                >
                  Créer un compte
                </Link>
              </div>
            </div>

          </form>

          {/* Info mobile */}
          <div className="block md:hidden mt-16">
            <Info />
          </div>
        </main>

        {/* Info desktop */}
        <div className="hidden md:block">
          <Info />
        </div>

      </div>
    </div>
  );
}
