import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";

const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const response = await fetch("http://127.0.0.1:5001/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, is_admin: false }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Registration failed");
            }

            // 注册成功后跳转登录页
            navigate("/login");
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-container">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />

                <label>Password:</label>
                <div className="password-field">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? "🙈" : "👁️"}
                    </button>
                </div>

                {error && <p className="error">{error}</p>}
                <button type="submit">Register</button>

                <p className="link" onClick={() => navigate("/login")}>
                    Already have an account? Login
                </p>
            </form>
        </div>
    );
};

export default RegisterPage;
