function LoginPage() {
  return (
    <main className="max-w-sm mx-auto mt-10 p-6">
      <h2 className="text-xl font-bold mb-4">Login</h2>

      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="border rounded p-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="border rounded p-2"
          />
        </div>

        <button type="submit" className="bg-black text-white rounded p-2">
          Login
        </button>
      </form>
    </main>
  );
}

export default LoginPage;
