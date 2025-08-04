// src/components/common/ProtectedLayout.js
import React from "react";
import Header from "./Header";

function ProtectedLayout({ children }) {
  return (
    <>
      <Header />
      <main className="container mt-4">{children}</main>
    </>
  );
}

export default ProtectedLayout;
