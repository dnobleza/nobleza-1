import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import { cardClasses } from './cardStyles';

// Add only real client quotes, with their permission.
// Each item looks like: { name: 'Client Name', role: 'Company or role', quote: 'What they said.' }
const TESTIMONIALS = [];

function Testimonials() {
  // While the list is empty, the component draws nothing at all: returning null means "render nothing".
  if (TESTIMONIALS.length === 0) {
    return null;
  }

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-title"
      className="relative pt-16 lg:pt-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading id="testimonials-title" title="What Clients Say" centered />
        </Reveal>
        {/* flex + justify-center keeps one or two quotes centered under the heading
            (a grid would pin them to the left). Cards are full width on phones, half on tablets, a third on desktop. */}
        <Reveal className="mt-10">
          <ul className="flex flex-wrap justify-center gap-5">
            {TESTIMONIALS.map(({ name, role, quote }) => (
              <li
                key={name}
                className={`w-full p-6 md:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] ${cardClasses}`}
              >
                <blockquote className="text-muted-strong">“{quote}”</blockquote>
                <p className="mt-4 font-semibold text-navy-deep">{name}</p>
                <p className="text-sm text-muted-strong">{role}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

export default Testimonials;
