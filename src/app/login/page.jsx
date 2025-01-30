import AuthForm from "@/components/authentification/AuthForm";
import React, { Suspense } from "react";

const LoginPage = () => {
  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <AuthForm />
      </Suspense>
    </main>
  );
};

export default LoginPage;
