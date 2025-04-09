import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/context/AuthContext"; // Correct import path if necessary
import "../../Styles/login.scss";
import { NavLink } from "react-router-dom";

export const Login = () => {
    const initialValues = { email: "", password: "" };
    const navigate = useNavigate();
    const [fetchError, setFetchError] = useState(null);
    const { login } = useAuth(); // Accessing the login function from AuthContext

    const handleSubmit = async (credentials) => {
        setFetchError(null); // Reset errors before making a new request
        try {
            // Calling the login method from useAuth
            await login(credentials.email, credentials.password);
            navigate("/"); // Redirect to home or dashboard after successful login
        } catch (error) {
            setFetchError("Login failed. Please check your credentials and try again.");
            console.error("Login error:", error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Login</h2>
                {fetchError && <div className="error-message">{fetchError}</div>}
                <Formik initialValues={initialValues} onSubmit={handleSubmit}>
                    <Form>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <Field type="email" id="email" name="email" />
                            <ErrorMessage name="email" component="div" className="error-message" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <Field type="password" id="password" name="password" />
                            <ErrorMessage name="password" component="div" className="error-message" />
                        </div>
                        <button type="submit">Login</button>
                    </Form>
                </Formik>
                <div className="forgot-password">
                    <NavLink to="/forgot-password">Forgot password?</NavLink>
                </div>
                <div className="create-account">
                    <NavLink to="/register">Create an Account</NavLink>
                </div>
            </div>
        </div>
    );
};

export default Login;
