import React from "react";
import { Form } from "react-bootstrap";

/**
 * Reusable form field component that standardizes form inputs
 * @param {string} label - The label text for the form field
 * @param {string} type - The input type (text, email, password, textarea, etc.)
 * @param {string} placeholder - Placeholder text for the input
 * @param {any} value - The current value of the input
 * @param {function} onChange - Function to handle value changes
 * @param {string} controlId - Unique identifier for the form control
 * @param {boolean} required - Whether the field is required
 * @param {number} rows - Number of rows for textarea (only applies to textarea type)
 * @param {number} maxLength - Maximum length for the input
 * @param {object} style - Additional styles to apply
 * @param {string} className - Additional CSS classes
 */
const FormField = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  controlId,
  required = false,
  rows,
  maxLength,
  style,
  className = "mb-3",
}) => {
  return (
    <Form.Group className={className} controlId={controlId}>
      <Form.Label className="primary">{label}</Form.Label>
      <Form.Control
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        rows={type === "textarea" ? rows : undefined}
        as={type === "textarea" ? "textarea" : undefined}
        maxLength={maxLength}
        style={style}
      />
    </Form.Group>
  );
};

export default FormField;
