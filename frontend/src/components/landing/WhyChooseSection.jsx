import { CodeXml, Headphones, Rocket, TrendingUp } from 'lucide-react';
import landingAssets from '../../assets/landingAssets';
import SectionHeading from './SectionHeading';
import { cardClasses } from './cardStyles';

// "key" matches the names you can use in landingAssets.featureIcons.
// "tone" picks the circle color: blue or orange (alternating, like the preview).
const FEATURES = [
  { key: 'customSolutions', Icon: CodeXml, tone: 'blue', title: 'Custom Solutions', text: 'Tailored to your unique needs.' },
  { key: 'onTimeDelivery', Icon: Rocket, tone: 'orange', title: 'On-Time Delivery', text: 'Meet your goals, always.' },
  { key: 'expertSupport', Icon: Headphones, tone: 'blue', title: 'Expert Support', text: "We're here when you need us." },
  { key: 'scalableGrowth', Icon: TrendingUp, tone: 'orange', title: 'Scalable Growth', text: 'Built to grow with you.' },
];

const TONES = {
  blue: 'bg-primary-soft text-primary-deep',
  orange: 'bg-accent-soft text-warning',
};

function WhyChooseSection() {
  const customIcons = landingAssets.featureIcons;

  return (
    <section id="why-choose" aria-labelledby="why-title" className="relative pt-16 lg:pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="why-title"
          title="Why Choose CodeHaus?"
          subtitle="We combine creativity, technology, and reliability to help your business thrive."
          centered
        />

        {/* 1 column on phones, 2 on tablets, 4 on desktop. */}
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ key, Icon, tone, title, text }) => (
            <li key={key} className={`flex items-center gap-3.5 p-5 ${cardClasses}`}>
              <span
                className={`flex size-14 shrink-0 items-center justify-center rounded-full ${TONES[tone]}`}
              >
                {customIcons?.[key] ? (
                  <img src={customIcons[key]} alt="" loading="lazy" className="size-8" />
                ) : (
                  <Icon aria-hidden="true" className="size-6" />
                )}
              </span>
              <div>
                <h3 className="text-lg font-semibold leading-6 text-navy-deep">{title}</h3>
                <p className="mt-0.5 text-sm text-muted-strong">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default WhyChooseSection;
