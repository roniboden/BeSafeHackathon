import PropTypes from "prop-types";
import { useNavigate } from "react-router";
import "./styles/ProfilePage.css";
import LogoutButton from "./components/LogoutButton";
import SafetyPoints from "./components/SafetyPoints";

const StatCard = ({ label, value, variant }) => (
  <div className={`profile-stat profile-stat--${variant}`}>
    <span className="profile-stat__value">{value}</span>
    <span className="profile-stat__label">{label}</span>
  </div>
);

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  variant: PropTypes.oneOf(["purple", "blue", "green", "yellow"]).isRequired,
};

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

  const initial = (username[0] || "U").toUpperCase();

  return (
    <div className="dashboard-page profile-page">
      {/* NAV (matches Dashboard) */}
      <nav className="dashboard-nav">
        <div className="user-welcome">
          <h1>{displayName}</h1>
          <p className="profile-subtitle">{email || " "}</p>
        </div>

        <div className="nav-controls">
          {/* Streak badge (same style) */}
          <div className="streak-badge" title={`Best streak: ${streakBest}`}>
            <span className="fire-icon">🔥</span>
            <span className="streak-value">{streakCurrent}</span>
          </div>

          {/* Points shop button (same as Dashboard) */}
          <button className="points-shop-button" onClick={() => navigate("/shop")}>
            <div className="points-icon-container">
              <span className="bank-icon">🏛️</span>
            </div>
            <div className="points-label-container">
              <span className="points-label">SAFETY POINTS</span>
              <SafetyPoints points={totalPoints} />
            </div>
          </button>

          {/* Avatar button */}
          <button className="profile-button" onClick={() => navigate("/dashboard")} title="Back to Dashboard">
            <div className="profile-avatar">{initial}</div>
          </button>

          <LogoutButton />
        </div>
      </nav>

      {/* CONTENT */}
      <main className="profile-main">
        {/* Top identity card */}
        <section className="profile-hero-card">
          <div className="profile-hero-left">
            <div className="profile-hero-avatar">{initial}</div>
            <div className="profile-hero-meta">
              <div className="profile-hero-name">{displayName}</div>
              <div className="profile-hero-email">{email}</div>
              <button className="profile-back-link" onClick={() => navigate("/dashboard")}>
                ← Back to Dashboard
              </button>
            </div>
          </div>

          <div className="profile-hero-right">
            <div className="profile-streak">
              <span className="profile-streak__icon">🔥</span>
              <div>
                <div className="profile-streak__value">{streakCurrent} day streak</div>
                <div className="profile-streak__sub">Best: {streakBest} days</div>
              </div>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="profile-grid">
          {/* Monthly performance */}
          <div className="profile-card profile-card--wide">
            <div className="profile-card__title">
              Monthly Performance {monthKey ? <span className="profile-card__muted">({monthKey})</span> : null}
            </div>

            <div className="profile-stats-grid">
              <StatCard label="Simulations" value={monthlyCounts.simulation ?? 0} variant="blue" />
              <StatCard label="Safety Tips" value={monthlyCounts.safetyTips ?? 0} variant="green" />
              <StatCard label="Good Reports" value={monthlyCounts.reportGood ?? 0} variant="yellow" />
              <StatCard label="Total Points" value={totalPoints} variant="purple" />
            </div>
          </div>

          {/* Inventory */}
          <div className="profile-card">
            <div className="profile-card__title">Inventory</div>

            {purchaseHistory.length === 0 ? (
              <div className="profile-empty">No purchases yet</div>
            ) : (
              <div className="profile-list">
                {purchaseHistory.slice(0, 5).map((item) => (
                  <div key={item.purchaseId} className="profile-list-row">
                    <span className="profile-list-row__name">{item.itemName}</span>
                    <span className="profile-list-row__date">
                      {item?.date ? new Date(item.date).toLocaleDateString() : ""}
                    </span>
                  </div>
                ))}
                <button className="profile-link-button" onClick={() => navigate("/shop")}>
                  View all in Shop →
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProfilePage;
