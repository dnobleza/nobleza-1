// A text field with an icon on the left. The label is hidden visually (sr-only)
// but screen readers still read it. "children" is an optional slot on the right
// (PasswordInput puts the eye button there).
function AuthInput({
  id,
  name,
  label,
  placeholder,
  type = 'text',
  icon: Icon,
  autoComplete,
  inputMode,
  children,
}) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
        />
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className="h-12 w-full [@media(max-height:820px)]:h-11 rounded-xl border border-line bg-surface pr-12 pl-12 text-base text-ink transition-colors duration-150 ease-out placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
        />
        {children}
      </div>
    </div>
  );
}

export default AuthInput;
