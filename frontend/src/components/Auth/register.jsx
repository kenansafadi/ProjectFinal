import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/register.scss";
import { useAuth } from "../../components/context/AuthContext"; // Correct import path if necessary

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        image: { url: "", alt: "" },
        state: "",
        country: "",
        city: "",
        street: "",
        houseNumber: "",
        zip: "",
    });

    const [registerError, setRegisterError] = useState(null);
    const navigate = useNavigate();
    const { register } = useAuth(); // Using the register function from useAuth

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setRegisterError(null);

        if (formData.password !== formData.confirmPassword) {
            setRegisterError("Passwords don't match!");
            return;
        }

        const registrationData = {
            name: {
                first: formData.firstName,
                middle: formData.middleName,
                last: formData.lastName,
            },
            phone: formData.phone,
            email: formData.email,
            password: formData.password,
            image: formData.image,
            address: {
                state: formData.state,
                country: formData.country,
                city: formData.city,
                street: formData.street,
                houseNumber: Number(formData.houseNumber),
                zip: Number(formData.zip),
            },
            isBusiness: true, // Assuming this is always true
        };

        try {
            await register(registrationData); // Call register from useAuth
            navigate("/login");
        } catch (error) {
            setRegisterError(error.message);
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                {["firstName", "middleName", "lastName", "phone", "email"].map((field) => (
                    <div key={field}>
                        <label>{field.replace(/([A-Z])/g, " $1").trim()}</label>
                        <input
                            type={field === "email" ? "email" : "text"}
                            name={field}
                            value={formData[field]}
                            onChange={handleChange}
                            required={field !== "middleName"}
                        />
                    </div>
                ))}
                {["password", "confirmPassword"].map((field) => (
                    <div key={field}>
                        <label>{field.replace(/([A-Z])/g, " $1").trim()}</label>
                        <input
                            type="password"
                            name={field}
                            value={formData[field]}
                            onChange={handleChange}
                            required
                        />
                    </div>
                ))}
                <div>
                    <label>Image URL</label>
                    <input
                        type="text"
                        name="image.url"
                        value={formData.image.url}
                        onChange={(e) => setFormData({ ...formData, image: { ...formData.image, url: e.target.value } })}
                    />
                </div>
                {["state", "country", "city", "street", "houseNumber", "zip"].map((field) => (
                    <div key={field}>
                        <label>{field.replace(/([A-Z])/g, " $1").trim()}</label>
                        <input
                            type={["houseNumber", "zip"].includes(field) ? "number" : "text"}
                            name={field}
                            value={formData[field]}
                            onChange={handleChange}
                            required
                        />
                    </div>
                ))}
                <button type="submit">Register</button>
            </form>
            {registerError && <p style={{ color: "red" }}>{registerError}</p>}
        </div>
    );
};

export default Register;
