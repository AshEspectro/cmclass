import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, ArrowRight } from 'lucide-react';
import { stories } from '../data/products';

const storiesImages = [
  'https://images.unsplash.com/photo-1620063224601-ead11b9737bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWlsb3JpbmclMjBzZXdpbmclMjB3b3Jrc2hvcHxlbnwxfHx8fDE3NjIyNTU3NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1760907949889-eb62b7fd9f75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwdGV4dGlsZSUyMHBhdHRlcm58ZW58MXx8fHwxNzYyMjU1NzQ3fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1761896902115-49793a359daf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW5zd2VhciUyMHNoaXJ0JTIwbWluaW1hbHxlbnwxfHx8fDE3NjIyNTU3NDd8MA&ixlib=rb-4.1.0&q=80&w=1080'
];

export const Stories = () => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="pt-20 sm:pt-24">
      {/* Hero */}
      <section className="py-20 lg:py-32 border-b border-gray-200">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="mb-6">STORIES</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Plongez dans l'univers de CM CLASS : découvrez nos artisans, notre vision du design et 
              les histoires qui façonnent chaque collection.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Story */}
      <section className="py-20 lg:py-32">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <motion.article
            className="grid md:grid-cols-2 gap-12 lg:gap-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-[4/5] bg-gray-100 overflow-hidden">
              <img
                src={storiesImages[0]}
                alt={stories[0].title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="inline-block border border-black px-4 py-1 text-xs mb-4 w-fit">
                {stories[0].category}
              </div>
              <h2 className="mb-4">{stories[0].title}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <Calendar size={16} />
                <span>{formatDate(stories[0].date)}</span>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed">{stories[0].excerpt}</p>
              <Link
                to={`/stories/${stories[0].id}`}
                className="inline-flex items-center gap-2 text-[#007B8A] hover:gap-3 transition-all duration-300"
              >
                <span>LIRE LA SUITE</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </motion.article>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {stories.slice(1).map((story, index) => (
              <motion.article
                key={story.id}
                className="group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={`/stories/${story.id}`}>
                  <div className="aspect-[4/5] bg-gray-100 mb-6 overflow-hidden">
                    <img
                      src={storiesImages[index + 1] || storiesImages[0]}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="inline-block border border-black px-4 py-1 text-xs mb-4">
                    {story.category}
                  </div>
                  <h3 className="mb-3 group-hover:text-[#007B8A] transition-colors duration-300">
                    {story.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Calendar size={16} />
                    <span>{formatDate(story.date)}</span>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">{story.excerpt}</p>
                  <span className="inline-flex items-center gap-2 text-[#007B8A] group-hover:gap-3 transition-all duration-300">
                    <span>LIRE LA SUITE</span>
                    <ArrowRight size={18} />
                  </span>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 lg:py-32 border-t border-gray-200">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-6">NE MANQUEZ RIEN</h2>
            <p className="text-gray-600 mb-8">
              Inscrivez-vous à notre newsletter pour recevoir nos dernières stories et actualités
            </p>
            <Link
              to="/#newsletter"
              className="inline-block bg-[#007B8A] text-white px-12 py-4 hover:bg-[#006170] transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              S'INSCRIRE
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
