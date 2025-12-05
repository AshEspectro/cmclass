import { ShieldCheck, Truck, RefreshCcw, Store, ChevronRight } from "lucide-react";
export default function Cartpage() {
    const services = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-black" />,
      title: "Paiement sécurisé",
      text: "Carte de crédit et de débit, Paypal et Apple Pay.",
    },
    {
      icon: <Truck className="w-6 h-6 text-black" />,
      title: "Livraison offerte",
      text: "Livraison avant Noël pour toute commande passée avant le 23 décembre à 11h59 selon la disponibilité produit.",
    },
    {
      icon: <RefreshCcw className="w-6 h-6 text-black" />,
      title: "Échange ou retour sans frais",
      text: "Profitez de notre période d'échange ou remboursement prolongée jusqu'au 31 janvier.",
    },
    {
      icon: <Store className="w-6 h-6 text-black" />,
      title: "Retrait en magasin",
      text: "Pour toute commande passée avant le 22 décembre à 11h59, retrait possible avant Noël selon la disponibilité produit.",
    },
  ];
  return (
    <div className=" flex flex-col bg-black/5  items-center justify-center lg:flex-row lg:space-x-8 mt-28"> 
        {/* Product Images */}
        
      <div className="w-sm   md:w-1/2 flex-col items-center md:pb-2 lg:pb-8 pb-2  mt-8 md:mt-0  mx-24 md:mx-28 lg:mx-32 xl:mx-52 overflow-hidden  bg-white">
  <div className="flex justify-center mb-6 md:mb-10 xl:mb-23 " ><img 
    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200" 
    alt="Inspiration" 
    className="w-69  mt-8 h-80 object-cover"
  /></div>

  <div className="py-8 flex flex-col items-center text-center">
    <h3 className="text-xl  mb-6">EN MANQUE D’INSPIRATION ?</h3>

    <button 
      className="border text-black px-12 py-3 rounded-full text-sm tracking-wide hover:bg-black hover:text-white transition-all duration-300 hover:scale-105">
      Commencer votre shopping
    </button>
  </div>
</div>




      {/* Product Info */}
      <div className="w-full md:w-1/3 mt-8 lg:mt-0 h-full bg-white px-8 md:px-12 lg:px-24 xl:px-32 flex justify-center flex-1  ">
        <div className=" py-12 h-132 md:h-200 ">
      {services.map((s, i) => (
        <div key={i} className="flex items-center space-y-3 space-x-2 py-6   border-b border-black/10">
          <div className="p-3 ">
            {s.icon}
          </div>
          <div>
          <h3 className="text-base font-medium">{s.title}</h3>
          <p className="text-xs text-black/60  sm:w-40 md:w-50 lg:w-60 leading-relaxed">
            {s.text}
          </p></div>
          <ChevronRight className="w-5 h-5 text-black ml-4 mt-3"/>
        </div>
      ))}
    </div>   
 
        </div>
   

     


    {/* Discovery section */}
      
    </div>  
  );
}