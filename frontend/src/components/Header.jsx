import logo from '../assets/logo/logo.svg';
function Header() {
  const AppName = import.meta.env.VITE_APP_NAME;

  return (
    <header className="border-b border-line p-4">
      <img src={logo} alt="CodeHaus" className="h-12 w-auto" />
    </header>
  );
}

export default Header;
