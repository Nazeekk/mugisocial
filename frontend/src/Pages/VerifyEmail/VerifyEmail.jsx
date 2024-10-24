import React from "react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      axios
        .get(`${BASE_URL}/api/auth/verify-email?token=${token}`)
        .then((response) => {
          console.log(response.data);
          navigate("/login");
        })
        .catch((error) => {
          console.error("Error verifying email:", error);
        });
    }
  }, [navigate, searchParams, BASE_URL]);

  return (
    <div>
      <h2>Verifying your email...</h2>
    </div>
  );
};

export default VerifyEmail;
