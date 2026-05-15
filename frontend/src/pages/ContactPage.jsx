/**
 * Contact page — static form shell (submission wired in a later phase)
 */
import "./ContactPage.css";

function ContactPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Contact form will connect to the backend in a later phase.");
  };

  return (
    <section className="page">
      <div className="container" style={{ maxWidth: "520px" }}>
        <h1 className="page-title">Contact us</h1>
        <p className="page-subtitle">
          Questions about a property or booking? Send us a message.
        </p>

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="contact-form__field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" type="text" required placeholder="Your name" />
          </div>

          <div className="contact-form__field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required placeholder="you@email.com" />
          </div>

          <div className="contact-form__field">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              placeholder="How can we help?"
            />
          </div>

          <button type="submit" className="btn">
            Send message
          </button>
        </form>
      </div>
    </section>
  );
}

export default ContactPage;
