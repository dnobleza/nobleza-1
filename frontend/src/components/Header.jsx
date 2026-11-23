import logo from '../assets/logo/logo.svg';
function Header() {
  return (
    <header className="border-b border-line p-4">
      <img src={logo} alt="CodeHaus" className="h-9 w-auto" />
    </header>
  );
}

export default Header;
