"use client";

import { BrowserRouter } from "react-router-dom";
import Login from "../../src/views/Login.jsx";

export default function LoginWithRouter() {
  return (
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
}
