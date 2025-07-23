import React, { useState } from "react";
import api from '../utils/api'
// Utility to get colors (reuse from above, or import)
const getColors = (accentColor) => {
  
  
  switch (accentColor) {
    case "blue": return { heading: "#1a237e", accent: "#1565c0", border: "#1976d2", text: "#222" };
    case "yellow": return { heading: "#b28704", accent: "#fbc02d", border: "#fbc02d", text: "#333" };
    case "green": return { heading: "#1b5e20", accent: "#388e3c", border: "#388e3c", text: "#222" };
    case "purple": return { heading: "#4a148c", accent: "#8e24aa", border: "#8e24aa", text: "#222" };
    case "red": return { heading: "#b71c1c", accent: "#d32f2f", border: "#d32f2f", text: "#222" };
    case "gray":
    return {
    heading: "#424242",   // Dark gray
    accent: "#616161",    // Mid gray
    border: "#757575",    // Light border gray
    text: "#212121"       // Very dark for contrast
  };
  default:
    return { heading: "#b71c1c", accent: "#d32f2f", border: "#d32f2f", text: "#222" };
  }
};

const ContactSection = ({ id = "contact", accentColor = "purple" }) => {
  const { heading, accent, border, text } = getColors(accentColor);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

       const handleSubmit = async (e) => {
         e.preventDefault();
         setSubmitting(true);
         setError('');
         setSubmitted(false);
         try {
           await api.post('/contact/message', form);
           setSubmitted(true);
           setForm({ name: "", phone: "", message: "" });
         } catch (err) {
           setError("Failed to send message. Please try again.");
       } finally {
         setSubmitting(false);
       }
       };

  return (
    <section id={id} className="max-w-3xl mx-auto my-16 px-4 py-8 bg-white rounded-xl shadow-md animate-fade-in">
      <h2
        className="text-2xl md:text-3xl font-extrabold mb-8 border-l-4 pl-4"
        style={{ color: heading, borderColor: border }}
      >
        Contact Us
      </h2>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Contact Info */}
        <div className="flex-1 flex flex-col gap-3 justify-center">
          <p style={{ color: text }}>
            Have questions? Email us at 
            <a
              href="mailto:support@example.com"
              className="text-sm font-bold underline ml-2"
              style={{ color: accent }}
            >
              support@example.com
            </a>
          </p>
          <p style={{ color: text }}>
            Or call:{" "}
            <span className="font-bold" style={{ color: accent }}>
              +91-XXXXXXXXXX
            </span>
          </p>
          <p style={{ color: text }}>
            Our team is available 7 days a week, 9am-7pm IST.
          </p>
        </div>
        {/* Contact Form */}
        <form
          className="flex-1 bg-gray-50 rounded-lg shadow p-6 flex flex-col gap-4 border-l-4"
          style={{ borderColor: border }}
          onSubmit={handleSubmit}
        >
          <label className="text-sm font-medium" style={{ color: text }}>
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              required
              onChange={handleChange}
              className="mt-1 mb-2 w-full p-2 border rounded focus:outline-none"
              style={{ borderColor: "#ddd" }}
            />
          </label>
          <label className="text-sm font-medium" style={{ color: text }}>
            Phone
            <input
              type="number"
              name="phone"
              value={form.phone}
              required
              onChange={handleChange}
              className="mt-1 mb-2 w-full p-2 border rounded focus:outline-none"
              style={{ borderColor: "#ddd" }}
            />
          </label>
          <label className="text-sm font-medium" style={{ color: text }}>
            Message
            <textarea
              name="message"
              value={form.message}
              required
              onChange={handleChange}
              rows={4}
              className="mt-1 mb-2 w-full p-2 border rounded focus:outline-none"
              style={{ borderColor: "#ddd" }}
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 px-4 py-2 rounded-full font-semibold transition shadow"
            style={{
              background: accent,
              color: "#fff",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
          {submitted && (
            <div className="text-green-700 font-medium mt-2">
              Thank you! We'll get back to you soon.
            </div>
          )}
          {error && (
            <div className="text-red-600 font-medium mt-2">{error}</div>
          )}
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
