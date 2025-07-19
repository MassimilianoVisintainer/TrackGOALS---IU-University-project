import { useNavigate, Link } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-light sticky-top shadow-sm px-4">
      <Link className="navbar-brand fw-bold" to="/habits">
        TrackGOALS
      </Link>

      <div className="collapse navbar-collapse show">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/habits">Habits</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/goals">Goals</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/dashboard">Dashboard</Link>
          </li>
        </ul>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </nav>
  );
}

export default Header;
