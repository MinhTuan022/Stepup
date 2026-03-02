import React, { useState } from 'react';
import './ContactPage.css';

const ContactPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <h1>Liên hệ với StepUp Shoes</h1>
        <p>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Vui lòng gửi thông tin liên hệ hoặc phản hồi qua biểu mẫu dưới đây.</p>
      </section>
      {/* <section className="contact-form-section">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Họ và tên</label>
            <input type="text" id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="message">Nội dung</label>
            <textarea id="message" name="message" value={form.message} onChange={handleChange} rows={5} required />
          </div>
          <button type="submit" className="submit-btn">Gửi liên hệ</button>
        </form>
        {submitted && (
          <div className="contact-success">
            <h3>Cảm ơn bạn đã liên hệ!</h3>
            <p>Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
          </div>
        )}
      </section> */}
      <section className="contact-info">
        <h2>Thông tin liên hệ</h2>
        <ul>
          <li><strong>Email:</strong> support@stepupshoes.vn</li>
          <li><strong>Hotline:</strong> 1900 1234</li>
          <li><strong>Địa chỉ:</strong> 123 Hà Nội</li>
        </ul>
      </section>
    </div>
  );
};

export default ContactPage;
