function Header() {
  const AppName = import.meta.env.VITE_APP_NAME;

  return (
    <header className="border-b p-4">
      <h1 className="text-2xl font-bold">{AppName}</h1>
    </header>
  );
}

export default Header;
