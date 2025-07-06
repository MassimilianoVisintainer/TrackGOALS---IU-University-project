import { useNavigate } from "react-router-dom";

function Header() {
    const navigate = useNavigate()
    const handleLogout = async () => {
    localStorage.removeItem("token");   // Clear JWT
    navigate("/login");                 // Redirect to Login
    }
    return (
        <div>
            <button onClick={handleLogout} className="btn btn-danger">
                Log out
            </button>
        </div>
    );
}

export default Header