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
  value,
  onChange,
  required,
  disabled,
  invalid,
  describedBy,
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
          // value + onChange make this a "controlled" input: React state owns the text.
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          // aria-invalid / aria-describedby tell screen readers about the error text.
          aria-invalid={invalid ? 'true' : undefined}
          aria-describedby={describedBy}
          className={`h-12 w-full [@media(max-height:820px)]:h-11 rounded-xl border bg-surface pr-12 pl-12 text-base text-ink transition-colors duration-150 ease-out placeholder:text-muted focus:ring-2 focus:outline-none disabled:opacity-60 ${
            invalid
              ? 'border-danger focus:border-danger focus:ring-danger/30'
              : 'border-line focus:border-primary focus:ring-primary/30'
          }`}
        />
        {children}
      </div>
    </div>
  );
}

export default AuthInput;
