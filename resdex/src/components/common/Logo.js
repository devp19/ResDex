import React from "react";
import LogoImage from "../../images/dark-transparent.png";

/**
 * Reusable Logo component for consistent branding across the application
 * @param {object} style - Additional styles to apply to the logo
 * @param {string} alt - Alt text for the logo image
 * @param {string} className - Additional CSS classes
 */
const Logo = ({
  style = { maxWidth: "70px", fill: "black" },
  alt = "resdex-logo",
  className = "",
}) => {
  return <img src={LogoImage} style={style} alt={alt} className={className} />;
};

export default Logo;
