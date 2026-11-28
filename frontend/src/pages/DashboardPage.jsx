import FeaturedProject from '../components/dashboard/FeaturedProject';
import GreetingCard from '../components/dashboard/GreetingCard';
import RecentUpdates from '../components/dashboard/RecentUpdates';
import RequestList from '../components/dashboard/RequestList';
import SummaryCards from '../components/dashboard/SummaryCards';
import { useAuth } from '../context/useAuth';
import {
  sampleFeaturedRequest,
  sampleRequests,
  sampleSummary,
} from '../data/dashboardSample';
import { getFirstName } from '../lib/names';

// The user is real (/auth/me). Everything else is sample data for now.
function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <GreetingCard firstName={getFirstName(user.name)} />
      <SummaryCards summary={sampleSummary} />
      <FeaturedProject request={sampleFeaturedRequest.request} />
      {/* Two columns (62% / 38%) only on wide screens. */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,62fr)_minmax(0,38fr)]">
        <RequestList requests={sampleRequests.requests} />
        <RecentUpdates updates={sampleSummary.recentUpdates} />
      </div>
    </div>
  );
}

export default DashboardPage;
