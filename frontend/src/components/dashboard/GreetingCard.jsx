import mascot from '../../assets/mascot/pilandok-welcome.webp';
import { appCardClasses } from '../app/cardStyles';

// The only mascot on the dashboard.
function GreetingCard({ firstName }) {
  return (
    <section
      className={`${appCardClasses} flex items-center justify-between gap-4 overflow-hidden pl-6 sm:pl-8`}
    >
      <div className="py-6 sm:py-8">
        <h1 className="text-2xl font-bold break-words text-navy-deep sm:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-2 text-muted-strong">
          Here&apos;s what&apos;s happening with your projects.
        </p>
      </div>
      {/* alt="" = decoration, so screen readers skip it. */}
      <img
        src={mascot}
        alt=""
        className="mr-4 h-28 w-auto shrink-0 self-end sm:mr-8 sm:h-36"
      />
    </section>
  );
}

export default GreetingCard;
