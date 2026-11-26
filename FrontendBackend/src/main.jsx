import { StrictMode, useEffect } from "react";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import "./App.css";
import App from "./App.jsx";
import Layout from "./components/Layout.jsx";
import About from "./views/About.jsx";
import Contact from "./views/Contact.jsx";
import FAQs from "./views/FAQs.jsx";
import Register from "./views/Register.jsx";
import ForgotPassword from "./views/ForgotPassword.jsx";
import NotFound from "./views/NotFound.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { UIProvider } from "./context/UIContext.jsx";

function InventoryRedirect() {
  useEffect(() => {
    window.location.replace("/inventory");
  }, []);
  return null;
}

export default function SpaRoot() {
  return (
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UIProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<App />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="faqs" element={<FAQs />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="dashboard" element={<InventoryRedirect />} />
              <Route path="workspace" element={<InventoryRedirect />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
  );
}
