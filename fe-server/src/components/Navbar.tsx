import React from "react";
import { useNavigate } from "react-router-dom";

type NavbarProps = {
  type: "login" | "register" | "logout";
};

const Navbar: React.FC<NavbarProps> = ({ type }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (type === "login") navigate("/login");
    else if (type === "register") navigate("/register");
    else if (type === "logout") {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const buttonLabel = {
    login: "Login",
    register: "Register",
    logout: "Logout",
  }[type];

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        backgroundColor: "#f5f5f5",
        borderBottom: "1px solid #ccc",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "1.5rem" }}>Authenticator</div>
      <button
        onClick={handleClick}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {buttonLabel}
      </button>
    </nav>
  );
};

export default Navbar;
