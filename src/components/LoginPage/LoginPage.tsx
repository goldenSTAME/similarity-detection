import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("http://127.0.0.1:5001/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Login failed");
            }

            const result = await response.json();

            // 保存 token 到 localStorage
            localStorage.setItem("auth_token", result.data.access_token);
            localStorage.setItem("user_info", JSON.stringify(result.data));

            // 可选：记住用户
            if (rememberMe) {
                localStorage.setItem("remember_email", email);
            } else {
                localStorage.removeItem("remember_email");
            }

            // 登录成功跳转
            navigate("/select-image", { replace: true });

        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
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

                <div className="remember-me">
                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                    />
                    <span>Remember Me</span>
                </div>

                {error && <p className="error">{error}</p>}
                <button type="submit">Login</button>

                <p className="link" onClick={() => navigate("/register")}>
                    Don’t have an account? Register
                </p>
            </form>
        </div>
    );
};

export default LoginPage;
