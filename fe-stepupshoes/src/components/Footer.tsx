import React from 'react'
import './Footer.css'

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>StepUp Shoes</h3>
          <p>
            Nâng tầm phong cách, bước đi tự tin cùng StepUp Shoes - Điểm đến
            tin cậy cho những đôi giày chất lượng.
          </p>
        </div>

        <div className="footer-section">
          <h4>Liên kết</h4>
          <ul>
            <li>
              <a href="#about">Về chúng tôi</a>
            </li>
            <li>
              <a href="#products">Sản phẩm</a>
            </li>
            <li>
              <a href="#contact">Liên hệ</a>
            </li>
            <li>
              <a href="#policy">Chính sách</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Hỗ trợ</h4>
          <ul>
            <li>
              <a href="#faq">Câu hỏi thường gặp</a>
            </li>
            <li>
              <a href="#shipping">Vận chuyển</a>
            </li>
            <li>
              <a href="#return">Đổi trả</a>
            </li>
            <li>
              <a href="#warranty">Bảo hành</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Liên hệ</h4>
          <ul>
            <li>contact@stepupshoes.com</li>
            <li>0123 456 789</li>
            <li>Hà Nội, Việt Nam</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>StepUp Shoes</p>
      </div>
    </footer>
  )
}

export default Footer
