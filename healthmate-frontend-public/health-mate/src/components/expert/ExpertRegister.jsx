import React, { useState } from "react";
import RegisterExpertInfo from "./RegisterExpertInfo.jsx";
import RegisterExpertCertificate from "./UploadCertificate.jsx";

const RegisterExpert = () => {
    const [userId, setUserId] = useState(null);
    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");

    const handleRegistered = (id, userEmail) => {
        setUserId(id);
        setEmail(userEmail);
    };

    return (
        <>
            {!userId ? (
                <RegisterExpertInfo onRegistered={handleRegistered} />
            ) : (
                <RegisterExpertCertificate userId={userId} email={email} token={token} />
            )}
        </>
    );
};

export default RegisterExpert;
