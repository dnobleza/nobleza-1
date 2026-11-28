import { appCardClasses } from '../components/app/cardStyles';

// Placeholder until the admin overview is built. No mascot on admin pages.
function AdminPage() {
  return (
    <section className={`${appCardClasses} p-8`}>
      <h1 className="text-3xl font-bold text-navy-deep">Overview</h1>
      <p className="mt-2 text-muted-strong">Admin tools are coming next.</p>
    </section>
  );
}

export default AdminPage;
