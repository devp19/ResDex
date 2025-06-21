import React from "react";
import Logo from "./Logo";

/**
 * Reusable page header component with logo and title
 * @param {string} title - The page title
 * @param {string} subtitle - Optional subtitle
 * @param {string} titleClassName - CSS class for title styling
 * @param {string} subtitleClassName - CSS class for subtitle styling
 * @param {object} logoStyle - Custom styles for the logo
 */
const PageHeader = ({
  title,
  subtitle,
  titleClassName = "primary monarque",
  subtitleClassName = "primary",
  logoStyle = { maxWidth: "70px", fill: "black" },
}) => {
  return (
    <>
      <div className="row justify-content-center d-flex display fade-in">
        <Logo style={logoStyle} />
      </div>
      <div className="row text-center fade-in">
        <p className="primary">⏐</p>
      </div>
      <div className="row text-center fade-in">
        <h1 className={titleClassName}>{title}</h1>
        {subtitle && <p className={subtitleClassName}>{subtitle}</p>}
      </div>
    </>
  );
};

export default PageHeader;
