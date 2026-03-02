import React from 'react';
import './AboutPage.css';

const AboutPage: React.FC = () => (
  <div className="about-page">
    <section className="about-hero">
      <h1>Về StepUp Shoes</h1>
      <p>StepUp Shoes là thương hiệu giày hiện đại, mang đến trải nghiệm mua sắm trực tuyến chuyên nghiệp và tiện lợi cho khách hàng Việt Nam.</p>
    </section>
    <section className="about-values">
      <h2>Giá trị cốt lõi</h2>
      <ul>
        <li><strong>Chất lượng:</strong> Sản phẩm được chọn lọc kỹ lưỡng, đảm bảo độ bền và sự thoải mái.</li>
        <li><strong>Đổi mới:</strong> Luôn cập nhật xu hướng thời trang mới nhất.</li>
        <li><strong>Khách hàng là trung tâm:</strong> Dịch vụ chăm sóc tận tâm, hỗ trợ 24/7.</li>
      </ul>
    </section>
    {/* <section className="about-team">
      <h2>Đội ngũ của chúng tôi</h2>
      <div className="team-grid">
        <div className="team-member">
          <div className="avatar" />
          <h3>Nguyễn Văn A</h3>
          <p>CEO & Founder</p>
        </div>
        <div className="team-member">
          <div className="avatar" />
          <h3>Trần Thị B</h3>
          <p>Quản lý sản phẩm</p>
        </div>
        <div className="team-member">
          <div className="avatar" />
          <h3>Lê Văn C</h3>
          <p>Chăm sóc khách hàng</p>
        </div>
      </div>
    </section> */}
    <section className="about-mission">
      <h2>Sứ mệnh</h2>
      <p>Đem lại sự tự tin và phong cách cho từng bước chân của bạn.</p>
    </section>
  </div>
);

export default AboutPage;
