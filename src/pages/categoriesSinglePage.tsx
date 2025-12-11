import HandbagsPage from "../components/CardLayout";
import HeroSection, { HeroProduct, ProductGrid } from "../components/Hero_cat";
import { ViewMoreButton } from "../components/ViewMoreBttn";

export default function Category() {
    return (
        <div className=" mt-8  ">
            <HandbagsPage/>
            <HeroSection
  image="/homme.jfif"
  title="Explore Our New Collection"
  description="Évoquant la douceur des fêtes et l’élégance discrète des saisons froides, cette chemise s’impose comme une pièce maîtresse d’un vestiaire pensé pour les instants partagés. Conçue dans une silhouette épurée, elle mêle lignes modernes et tradition réinventée, révélant un tissu à la fois léger, chaleureux et subtilement texturé "
  
/>
<ProductGrid limit={8}/>

<HeroProduct
  image="/woman.jfif"
  
  
/>
<ProductGrid/>
<ViewMoreButton />

        </div>
    );
}