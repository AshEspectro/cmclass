interface CategoryHeroProps {
  campaignImage?: string;
  campaignTitle?: string;
  campaignGenreText?: string;
}

export const CategoryHero = ({
  campaignImage,
  campaignTitle,
  campaignGenreText,
}: CategoryHeroProps) => {
  if (!campaignImage || !campaignTitle) {
    return null;
  }

  const genreText = campaignGenreText?.trim() || 'Exclusivité';

  return (
    <>
      <div className="relative w-full h-[75vh] sm:h-[75vh] md:h-[85vh] lg:h-screen overflow-hidden">
        <img
          src={campaignImage}
          alt={campaignTitle}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent" />
      </div>

      <div className="relative pt-12  px-4 sm:px-6 lg:px-12 h-full flex flex-col items-center justify-center text-center">
        <p className="uppercase text-[0.625rem] sm:text-xs md:text-xs lg:text-xs tracking-widest">
          {genreText}
        </p>
        <div className="mt-2 sm:mt-3">
          <h3 className="text-[1.1rem] sm:text-md md:text-md lg:text-3xl font-semibold hover:text-[#007B8A] transition-colors duration-300 cursor-pointer tracking-widest">
            {campaignTitle}
          </h3>
        </div>
      </div>
    </>
  );
};
