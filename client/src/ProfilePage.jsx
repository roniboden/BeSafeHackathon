import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

/* ---------- Reusable Stat Card ---------- */
const StatCard = ({ label, value, color }) => (
  <div className={`${color} p-4 rounded-2xl text-center`}>
    <span className="block text-2xl font-black">{value}</span>
    <span className="text-xs uppercase font-semibold text-gray-600">
      {label}
    </span>
  </div>
);

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  color: PropTypes.string.isRequired,
};

/* ---------- Profile Page ---------- */
function ProfilePage() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("besafe_user") || "{}");

  const username = user?.username || "";
  const displayName = user?.profile?.displayName || username || "User";
  const email = user?.email || "";
  const streakCurrent = user?.streak?.current ?? 0;
  const streakBest = user?.streak?.best ?? 0;
  const monthKey = user?.monthKey || "";
  const monthlyCounts = user?.monthlyCounts || {};
  const totalPoints = user?.totalPoints ?? 0;
  const purchaseHistory = user?.purchaseHistory || [];

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-indigo-600 font-semibold"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl shadow-sm p-6 flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {(username[0] || "U").toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <p className="text-gray-500">{email}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-orange-500 font-bold text-xl flex items-center gap-2">
            🔥 {streakCurrent} Day Streak
          </div>
          <p className="text-xs text-gray-400">
            Best: {streakBest} days
          </p>
        </div>
      </div>

      {/* Stats & Inventory */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monthly Stats */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">
            Monthly Performance {monthKey && `(${monthKey})`}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Simulations"
              value={monthlyCounts.simulation ?? 0}
              color="bg-blue-50"
            />
            <StatCard
              label="Safety Tips"
              value={monthlyCounts.safetyTips ?? 0}
              color="bg-green-50"
            />
            <StatCard
              label="Good Reports"
              value={monthlyCounts.reportGood ?? 0}
              color="bg-yellow-50"
            />
            <StatCard
              label="Total Points"
              value={totalPoints}
              color="bg-purple-50"
            />
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Inventory</h2>

          {purchaseHistory.length === 0 ? (
            <p className="text-sm text-gray-400">No purchases yet</p>
          ) : (
            <div className="space-y-3">
              {purchaseHistory.slice(0, 5).map((item) => (
                <div
                  key={item.purchaseId}
                  className="flex justify-between text-sm border-b pb-2"
                >
                  <span>{item.itemName}</span>
                  <span className="font-mono text-gray-400">
                    {item?.date
                      ? new Date(item.date).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
