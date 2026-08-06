import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BannerSlider.css';

interface Banner {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
}

const BannerSlider: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get('/api/banners');
        if (res.data && res.data.length > 0) {
          setBanners(res.data);
        }
      } catch (err) {
        console.error('Lỗi khi lấy danh sách banner:', err);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  if (banners.length === 0) {
    return (
      <div className="banner-fallback">
        <div className="banner-fallback-content">
          <h1>TRUNG TÂM CHIẾU PHIM QUỐC GIA</h1>
          <p>Trải nghiệm điện ảnh đỉnh cao với hệ thống phòng chiếu hiện đại bậc nhất</p>
        </div>
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  return (
    <div className="banner-slider">
      <div 
        className="banner-slider-track"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner._id} className="banner-slide">
            <img src={banner.imageUrl} alt={banner.title} className="banner-img" />
            <div className="banner-overlay">
              <div className="banner-text">
                <h2>{banner.title}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button className="slider-btn prev-btn" onClick={prevSlide}>❮</button>
          <button className="slider-btn next-btn" onClick={nextSlide}>❯</button>
          <div className="slider-dots">
            {banners.map((_, idx) => (
              <span
                key={idx}
                className={`dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerSlider;
