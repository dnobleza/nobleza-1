// Orange bar + H2 + optional subtitle. Used by several landing sections.
// Props are the values a parent passes in, like function arguments:
//   id        = the h2's id (the section points to it with aria-labelledby)
//   title     = the heading text
//   subtitle  = optional line under the heading
//   centered  = true centers everything, false aligns it left
function SectionHeading({ id, title, subtitle, centered = false }) {
  return (
    <div className={centered ? 'text-center' : ''}>
      <div
        aria-hidden="true"
        className={`mb-3 h-1 w-10 rounded bg-accent ${centered ? 'mx-auto' : ''}`}
      />
      <h2
        id={id}
        className="text-[32px] font-bold leading-10 text-navy-deep lg:text-[40px] lg:leading-12"
      >
        {title}
      </h2>
      {subtitle && <p className="mt-2.5 text-balance text-lg text-muted-strong">{subtitle}</p>}
    </div>
  );
}

export default SectionHeading;
