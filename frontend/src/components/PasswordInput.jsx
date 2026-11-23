import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import AuthInput from './AuthInput';

function PasswordInput({ id, name, label, placeholder, autoComplete }) {
  // State = a value React remembers between renders. When we change it with
  // setVisible, React draws this component again with the new value.
  const [visible, setVisible] = useState(false);

  return (
    <AuthInput
      id={id}
      name={name}
      label={label}
      placeholder={placeholder}
      type={visible ? 'text' : 'password'}
      icon={Lock}
      autoComplete={autoComplete}
    >
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute top-1/2 right-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors duration-150 ease-out hover:text-ink focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
      >
        {/* Same as the mockup: crossed-out eye = password is hidden now */}
        {visible ? (
          <Eye aria-hidden="true" className="size-5" />
        ) : (
          <EyeOff aria-hidden="true" className="size-5" />
        )}
      </button>
    </AuthInput>
  );
}

export default PasswordInput;
