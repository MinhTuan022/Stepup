-- =====================================
-- TẠO CƠ SỞ DỮ LIỆU
-- =====================================
CREATE DATABASE StepUpShoesDB;
GO

USE StepUpShoesDB;
GO

-- =====================================
-- BẢNG DANH MỤC SẢN PHẨM
-- =====================================
CREATE TABLE DanhMuc (
    MaDanhMuc INT PRIMARY KEY IDENTITY(1,1),
    TenDanhMuc NVARCHAR(100) NOT NULL,
    MoTa NVARCHAR(500),
    MaDanhMucCha INT NULL FOREIGN KEY REFERENCES DanhMuc(MaDanhMuc),
    TrangThai BIT DEFAULT 1,                  -- 1: hien thi, 0: an
    NgayTao DATETIME DEFAULT GETDATE()
);
GO

-- =====================================
-- BẢNG TỈNH / VÙNG VẬN CHUYỂN
-- =====================================

CREATE TABLE TinhThanh (
    MaTinh NVARCHAR(50) PRIMARY KEY,
    TenTinh NVARCHAR(255) NOT NULL,
    Loai NVARCHAR(50),
    Phi DECIMAL(18,2) NOT NULL DEFAULT 30000,
    MoTa NVARCHAR(500),
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE()
);
GO

-- Dữ liệu mẫu (seed) cho bảng TinhThanh dựa trên danh sách tỉnh/thành cung cấp

-- =====================================
-- BẢNG SẢN PHẨM
-- =====================================
CREATE TABLE SanPham (
    MaSanPham INT PRIMARY KEY IDENTITY(1,1),
    TenSanPham NVARCHAR(200) NOT NULL,
    MoTa NVARCHAR(MAX),
    ThuongHieu NVARCHAR(100),
    MaDanhMuc INT FOREIGN KEY REFERENCES DanhMuc(MaDanhMuc),
    GiaCoBan DECIMAL(18,2) NOT NULL CHECK (GiaCoBan >= 0),
    TrangThai BIT DEFAULT 1,                  -- 1: con kinh doanh, 0: ngung
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE()
);
GO

-- =====================================
-- BẢNG CHI TIẾT SẢN PHẨM
-- =====================================
CREATE TABLE ChiTietSanPham (
    MaChiTiet INT PRIMARY KEY IDENTITY(1,1),
    MaSanPham INT FOREIGN KEY REFERENCES SanPham(MaSanPham),
    MaSKU NVARCHAR(50) UNIQUE NOT NULL,       -- Ma SKU rieng tung bien the
    MauSac NVARCHAR(50) NOT NULL,
    Size NVARCHAR(10) NOT NULL,
    GiaBan DECIMAL(18,2) NOT NULL CHECK (GiaBan >= 0),
    SoLuongTon INT DEFAULT 0 CHECK (SoLuongTon >= 0),
    TrangThai BIT DEFAULT 1,                  -- 1: con hang, 0: het hang
    HinhAnhChinh NVARCHAR(MAX),
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE(),
    CONSTRAINT UQ_ChiTietSanPham UNIQUE (MaSanPham, MauSac, Size)
);
GO

-- =====================================
-- BẢNG HÌNH ẢNH CHI TIẾT SẢN PHẨM
-- =====================================
CREATE TABLE HinhAnhChiTiet (
    MaHinhAnh INT PRIMARY KEY IDENTITY(1,1),
    MaChiTiet INT FOREIGN KEY REFERENCES ChiTietSanPham(MaChiTiet),
    DuongDan NVARCHAR(MAX) NOT NULL,
    LaAnhChinh BIT DEFAULT 0,
    ThuTu INT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE()
);
GO

-- =====================================
-- BẢNG NGƯỜI DÙNG
-- =====================================
CREATE TABLE NguoiDung (
    MaNguoiDung INT PRIMARY KEY IDENTITY(1,1),
    TenDangNhap NVARCHAR(50) UNIQUE NOT NULL,
    MatKhau NVARCHAR(255) NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    HoTen NVARCHAR(100) NOT NULL,
    SoDienThoai NVARCHAR(15),
    DiaChi NVARCHAR(255),
    MaTinh NVARCHAR(50) NULL FOREIGN KEY REFERENCES TinhThanh(MaTinh),
    VaiTro NVARCHAR(20)
        CHECK (VaiTro IN ('khach_hang', 'nhan_vien', 'quan_tri'))
        DEFAULT 'khach_hang',
    TrangThai BIT DEFAULT 1,
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE()
);
GO

-- =====================================
-- BẢNG GIỎ HÀNG
-- =====================================
CREATE TABLE GioHang (
    MaGioHang INT PRIMARY KEY IDENTITY(1,1),
    MaNguoiDung INT FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    MaChiTiet INT FOREIGN KEY REFERENCES ChiTietSanPham(MaChiTiet),
    SoLuong INT NOT NULL CHECK (SoLuong > 0),
    NgayThem DATETIME DEFAULT GETDATE(),
    UNIQUE (MaNguoiDung, MaChiTiet)
);
GO

-- =====================================
-- BẢNG ĐƠN HÀNG
-- =====================================
CREATE TABLE DonHang (
    MaDonHang INT PRIMARY KEY IDENTITY(1,1),
    MaNguoiDung INT FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    TongTien DECIMAL(18,2) NOT NULL,
    PhiVanChuyen DECIMAL(18,2) DEFAULT 0,
    GiamGia DECIMAL(18,2) DEFAULT 0,
    ThanhTien DECIMAL(18,2) NOT NULL,
    TrangThaiDonHang NVARCHAR(50)
        CHECK (TrangThaiDonHang IN (
            'cho_xac_nhan', 'chuan_bi_hang', 'yeu_cau_huy', 'dang_giao_hang', 'da_giao_hang', 'nhan_thanh_cong', 'hoan_thanh', 'huy'
        ))
        DEFAULT 'cho_xac_nhan',
    TrangThaiThanhToan NVARCHAR(50)
        CHECK (TrangThaiThanhToan IN (
            'chua_thanh_toan', 'da_thanh_toan', 'hoan_tien'
        ))
        DEFAULT 'chua_thanh_toan',
    PhuongThucThanhToan NVARCHAR(50)
        CHECK (PhuongThucThanhToan IN (
            'tien_mat', 'chuyen_khoan', 'the_tin_dung', 'vi_dien_tu'
        )),
    LoaiDonHang NVARCHAR(20)
        CHECK (LoaiDonHang IN ('online', 'tai_quay'))
        DEFAULT 'online',
    DiaChiGiaoHang NVARCHAR(500) NOT NULL,
    SoDienThoaiNhan NVARCHAR(15) NOT NULL,
    NguoiNhan NVARCHAR(100) NOT NULL,
    GhiChu NVARCHAR(500),
    NgayDatHang DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE()
);
GO

-- =====================================
-- BẢNG CHI TIẾT ĐƠN HÀNG
-- =====================================
CREATE TABLE ChiTietDonHang (
    MaChiTietDon INT PRIMARY KEY IDENTITY(1,1),
    MaDonHang INT FOREIGN KEY REFERENCES DonHang(MaDonHang),
    MaChiTiet INT FOREIGN KEY REFERENCES ChiTietSanPham(MaChiTiet),
    SoLuong INT NOT NULL CHECK (SoLuong > 0),
    DonGia DECIMAL(18,2) NOT NULL,
    ThanhTien DECIMAL(18,2) NOT NULL,
    UNIQUE (MaDonHang, MaChiTiet)
);
GO

-- =====================================
-- BẢNG ĐÁNH GIÁ SẢN PHẨM
-- =====================================
CREATE TABLE DanhGia (
    MaDanhGia INT PRIMARY KEY IDENTITY(1,1),
    MaChiTiet INT FOREIGN KEY REFERENCES ChiTietSanPham(MaChiTiet),
    MaNguoiDung INT FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    Diem INT CHECK (Diem BETWEEN 1 AND 5) NOT NULL,
    NoiDung NVARCHAR(1000),
    TrangThai BIT DEFAULT 1,
    NgayDanhGia DATETIME DEFAULT GETDATE(),
    CONSTRAINT UQ_DanhGia UNIQUE (MaChiTiet, MaNguoiDung)
);
GO

-- =====================================
-- BẢNG LỊCH SỬ TRẠNG THÁI ĐƠN HÀNG
-- =====================================
CREATE TABLE LichSuTrangThaiDonHang (
    MaLichSu INT PRIMARY KEY IDENTITY(1,1),
    MaDonHang INT FOREIGN KEY REFERENCES DonHang(MaDonHang),
    TrangThaiCu NVARCHAR(50),
    TrangThaiMoi NVARCHAR(50) NOT NULL,
    GhiChu NVARCHAR(500),
    NguoiCapNhat INT FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    NgayCapNhat DATETIME DEFAULT GETDATE()
);
GO

-- =====================================
-- BẢNG VOUCHER
-- =====================================
CREATE TABLE Voucher (
    MaVoucher INT PRIMARY KEY IDENTITY(1,1),
    Code NVARCHAR(50) UNIQUE NOT NULL,
    MoTa NVARCHAR(255),
    LoaiGiam NVARCHAR(20)
        CHECK (LoaiGiam IN ('phan_tram', 'so_tien')) NOT NULL,
    GiaTriGiam DECIMAL(18,2) NOT NULL,
    GiamToiDa DECIMAL(18,2),
    GiaTriToiThieu DECIMAL(18,2) DEFAULT 0,
    SoLuong INT CHECK (SoLuong >= 0),
    SoLuongDaDung INT DEFAULT 0,
    NgayBatDau DATETIME NOT NULL,
    NgayKetThuc DATETIME NOT NULL,
    TrangThai BIT DEFAULT 1,
    NgayTao DATETIME DEFAULT GETDATE()
);
GO

-- =====================================
-- BẢNG LỊCH SỬ SỬ DỤNG VOUCHER
-- =====================================
CREATE TABLE LichSuVoucher (
    MaLichSu INT PRIMARY KEY IDENTITY(1,1),
    MaVoucher INT FOREIGN KEY REFERENCES Voucher(MaVoucher),
    MaDonHang INT FOREIGN KEY REFERENCES DonHang(MaDonHang),
    MaNguoiDung INT FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    GiaTriGiam DECIMAL(18,2) NOT NULL,
    NgaySuDung DATETIME DEFAULT GETDATE()
);
GO

-- =====================================
-- DỮ LIỆU MẪU BAN ĐẦU
-- =====================================

INSERT INTO TinhThanh (MaTinh, TenTinh, Loai, Phi, MoTa)
VALUES
(N'HN', N'Hà Nội', N'Tỉnh/Thành', 0, N'Thủ đô, miễn phí giao hàng nội thành'),
(N'HCM', N'Thành phố Hồ Chí Minh', N'Tỉnh/Thành', 90000, NULL),
(N'DN', N'Đà Nẵng', N'Tỉnh/Thành', 65000, NULL),
(N'HP', N'Hải Phòng', N'Tỉnh/Thành', 35000, NULL),
(N'CT', N'Cần Thơ', N'Tỉnh/Thành', 100000, NULL),
(N'HUE', N'Thừa Thiên Huế', N'Tỉnh/Thành', 65000, NULL),
(N'LC', N'Lai Châu', N'Tỉnh/Thành', 60000, NULL),
(N'DB', N'Điện Biên', N'Tỉnh/Thành', 60000, NULL),
(N'SL', N'Sơn La', N'Tỉnh/Thành', 50000, NULL),
(N'LS', N'Lạng Sơn', N'Tỉnh/Thành', 45000, NULL),
(N'QN', N'Quảng Ninh', N'Tỉnh/Thành', 40000, NULL),
(N'TH', N'Thanh Hóa', N'Tỉnh/Thành', 45000, NULL),
(N'NA', N'Nghệ An', N'Tỉnh/Thành', 50000, NULL),
(N'HT', N'Hà Tĩnh', N'Tỉnh/Thành', 55000, NULL),
(N'CB', N'Cao Bằng', N'Tỉnh/Thành', 55000, NULL),
(N'TQ', N'Tuyên Quang', N'Tỉnh/Thành', 40000, NULL),
(N'LCYB', N'Lào Cai', N'Tỉnh/Thành', 50000, NULL),
(N'BK', N'Bắc Kạn', N'Tỉnh/Thành', 40000, NULL),
(N'PT', N'Phú Thọ', N'Tỉnh/Thành', 30000, NULL),
(N'BN', N'Bắc Ninh', N'Tỉnh/Thành', 25000, NULL),
(N'HY', N'Hưng Yên', N'Tỉnh/Thành', 25000, NULL),
(N'NB', N'Ninh Bình', N'Tỉnh/Thành', 35000, NULL),
(N'BD', N'Bình Dương', N'Tỉnh/Thành', 90000, NULL),
(N'BRVT', N'Bà Rịa - Vũng Tàu', N'Tỉnh/Thành', 95000, NULL),
(N'KH', N'Khánh Hòa', N'Tỉnh/Thành', 80000, NULL),
(N'DL', N'Đắk Lắk', N'Tỉnh/Thành', 85000, NULL),
(N'GL', N'Gia Lai', N'Tỉnh/Thành', 80000, NULL),
(N'LD', N'Lâm Đồng', N'Tỉnh/Thành', 90000, NULL),
(N'QT', N'Quảng Trị', N'Tỉnh/Thành', 60000, NULL),
(N'QB', N'Quảng Bình', N'Tỉnh/Thành', 60000, NULL),
(N'QNAM', N'Quảng Nam', N'Tỉnh/Thành', 70000, NULL),
(N'QNG', N'Quảng Ngãi', N'Tỉnh/Thành', 70000, NULL),
(N'BDINH', N'Bình Định', N'Tỉnh/Thành', 75000, NULL),
(N'PY', N'Phú Yên', N'Tỉnh/Thành', 75000, NULL),
(N'LA', N'Long An', N'Tỉnh/Thành', 95000, NULL),
(N'AG', N'An Giang', N'Tỉnh/Thành', 105000, NULL),
(N'KG', N'Kiên Giang', N'Tỉnh/Thành', 105000, NULL),
(N'CM', N'Cà Mau', N'Tỉnh/Thành', 120000, NULL);
GO
-- Danh mục (20 danh mục)
INSERT INTO DanhMuc (TenDanhMuc, MoTa, MaDanhMucCha, TrangThai) VALUES
(N'Giày Thể Thao', N'Giày dành cho thể thao và hoạt động năng động', NULL, 1),
(N'Giày Chạy Bộ', N'Giày chuyên dụng cho chạy bộ', 1, 1),
(N'Giày Bóng Đá', N'Giày chuyên dụng cho bóng đá', 1, 1),
(N'Giày Tennis', N'Giày chuyên dụng cho tennis', 1, 1),
(N'Giày Bóng Rổ', N'Giày chuyên dụng cho bóng rổ', 1, 1),
(N'Giày Sneaker', N'Giày thời trang đi thường ngày', NULL, 1),
(N'Giày Low Top', N'Sneaker cổ thấp', 6, 1),
(N'Giày High Top', N'Sneaker cổ cao', 6, 1),
(N'Giày Lifestyle', N'Giày phong cách sống', NULL, 1),
(N'Giày Da', N'Giày da cao cấp', 9, 1),
(N'Giày Lười', N'Giày lười tiện dụng', 9, 1),
(N'Dép & Sandal', N'Dép và sandal các loại', NULL, 1),
(N'Dép Quai Ngang', N'Dép quai ngang thời trang', 12, 1),
(N'Sandal Thể Thao', N'Sandal cho hoạt động thể thao', 12, 1),
(N'Giày Tây', N'Giày tây lịch sự', NULL, 1),
(N'Giày Oxford', N'Giày Oxford cổ điển', 15, 1),
(N'Giày Boots', N'Giày boots phong cách', NULL, 1),
(N'Boots Cổ Cao', N'Boots cổ cao thời trang', 17, 1),
(N'Giày Trẻ Em', N'Giày dành cho trẻ em', NULL, 1),
(N'Phụ Kiện Giày', N'Phụ kiện chăm sóc giày', NULL, 1);
GO

-- Sản phẩm (25 sản phẩm)
INSERT INTO SanPham (TenSanPham, ThuongHieu, MaDanhMuc, GiaCoBan, MoTa, TrangThai) VALUES
(N'Nike Air Force 1', N'Nike', 7, 2500000, N'Giày thể thao biểu tượng với thiết kế cổ điển, đế Air êm ái', 1),
(N'Adidas Ultraboost 22', N'Adidas', 2, 4500000, N'Giày chạy bộ cao cấp với công nghệ Boost đệm cực tốt', 1),
(N'Nike Air Max 270', N'Nike', 7, 3500000, N'Thiết kế hiện đại với đơn vị Air lớn nhất từ trước đến nay', 1),
(N'Adidas Stan Smith', N'Adidas', 7, 2200000, N'Giày tennis trắng cổ điển, phong cách tối giản', 1),
(N'Converse Chuck Taylor All Star', N'Converse', 8, 1500000, N'Giày sneaker cổ cao huyền thoại, phong cách Mỹ', 1),
(N'Puma RS-X', N'Puma', 6, 2800000, N'Giày thể thao phong cách retro với teknologi Running System', 1),
(N'New Balance 574', N'New Balance', 9, 2600000, N'Giày lifestyle thoải mái, thiết kế đa năng', 1),
(N'Vans Old Skool', N'Vans', 7, 1800000, N'Giày skate truyền thống với sọc Vans đặc trưng', 1),
(N'Nike Air Jordan 1', N'Nike', 5, 5500000, N'Giày bóng rổ huyền thoại của Michael Jordan', 1),
(N'Adidas Superstar', N'Adidas', 7, 2300000, N'Giày shell-toe biểu tượng của văn hóa hip-hop', 1),
(N'Nike React Infinity Run', N'Nike', 2, 3800000, N'Giày chạy bộ với React foam giúp giảm chấn thương', 1),
(N'Puma Suede Classic', N'Puma', 7, 2000000, N'Giày da lộn cổ điển, phong cách vintage', 1),
(N'Reebok Classic Leather', N'Reebok', 9, 2100000, N'Giày da mềm mại, thoải mái cả ngày', 1),
(N'New Balance 990v5', N'New Balance', 2, 5200000, N'Giày chạy cao cấp Made in USA, êm ái vượt trội', 1),
(N'Nike Pegasus 39', N'Nike', 2, 3200000, N'Giày chạy đa năng, phù hợp mọi cự ly', 1),
(N'Adidas NMD R1', N'Adidas', 6, 3600000, N'Giày streetwear với công nghệ Boost và Primeknit', 1),
(N'Converse Chuck 70', N'Converse', 8, 2000000, N'Phiên bản nâng cấp của Chuck Taylor với chất liệu cao cấp hơn', 1),
(N'Asics Gel-Kayano 29', N'Asics', 2, 4200000, N'Giày chạy bộ với công nghệ Gel giảm chấn tuyệt vời', 1),
(N'Nike Blazer Mid 77', N'Nike', 8, 2700000, N'Giày bóng rổ vintage, phong cách retro', 1),
(N'Adidas Samba', N'Adidas', 9, 2400000, N'Giày bóng đá trong nhà, thiết kế cổ điển', 1),
(N'Vans Authentic', N'Vans', 7, 1600000, N'Giày canvas đơn giản, dễ phối đồ', 1),
(N'Puma Cali', N'Puma', 7, 2500000, N'Giày thể thao nữ phong cách California', 1),
(N'Under Armour HOVR Phantom', N'Under Armour', 2, 3400000, N'Giày chạy với công nghệ HOVR giúp hoàn trả năng lượng', 1),
(N'Fila Disruptor II', N'Fila', 6, 2200000, N'Giày chunky sneaker phong cách daddy shoes', 1),
(N'Nike Dunk Low', N'Nike', 7, 3000000, N'Giày bóng rổ đa sắc màu, hot trend streetwear', 1);
GO

-- Chi tiết sản phẩm (hơn 100 biến thể - mỗi sản phẩm nhiều màu và size)
INSERT INTO ChiTietSanPham (MaSanPham, MaSKU, MauSac, Size, GiaBan, SoLuongTon, HinhAnhChinh, TrangThai) VALUES
-- Nike Air Force 1
(1, 'NIKE-AF1-WH-39', N'Trắng', '39', 2500000, 15, '/uploads/1.jpg', 1),
(1, 'NIKE-AF1-WH-40', N'Trắng', '40', 2500000, 20, '/uploads/2.jpg', 1),
(1, 'NIKE-AF1-WH-41', N'Trắng', '41', 2500000, 18, '/uploads/3.jpg', 1),
(1, 'NIKE-AF1-BK-40', N'Đen', '40', 2500000, 12, '/uploads/4.jpg', 1),
(1, 'NIKE-AF1-BK-41', N'Đen', '41', 2500000, 10, '/uploads/5.jpg', 1),
-- Adidas Ultraboost 22
(2, 'ADI-UB22-BK-40', N'Đen', '40', 4500000, 8, '/uploads/6.jpg', 1),
(2, 'ADI-UB22-BK-41', N'Đen', '41', 4500000, 10, '/uploads/7.jpg', 1),
(2, 'ADI-UB22-BK-42', N'Đen', '42', 4500000, 7, '/uploads/8.jpg', 1),
(2, 'ADI-UB22-WH-40', N'Trắng', '40', 4500000, 6, '/uploads/9.jpg', 1),
(2, 'ADI-UB22-BL-41', N'Xanh Navy', '41', 4500000, 5, '/uploads/10.jpg', 1),
-- Nike Air Max 270
(3, 'NIKE-AM270-BK-40', N'Đen', '40', 3500000, 12, '/uploads/11.jpg', 1),
(3, 'NIKE-AM270-WH-41', N'Trắng', '41', 3500000, 15, '/uploads/12.jpg', 1),
(3, 'NIKE-AM270-GR-42', N'Xám', '42', 3500000, 10, '/uploads/13.jpg', 1),
(3, 'NIKE-AM270-RD-40', N'Đỏ', '40', 3500000, 8, '/uploads/14.jpg', 1),
-- Adidas Stan Smith
(4, 'ADI-SS-WH-39', N'Trắng/Xanh', '39', 2200000, 20, '/uploads/15.jpg', 1),
(4, 'ADI-SS-WH-40', N'Trắng/Xanh', '40', 2200000, 25, '/uploads/16.jpg', 1),
(4, 'ADI-SS-WH-41', N'Trắng/Xanh', '41', 2200000, 22, '/uploads/17.jpg', 1),
(4, 'ADI-SS-WH-42', N'Trắng/Xanh', '42', 2200000, 18, '/uploads/18.jpg', 1),
-- Converse Chuck Taylor
(5, 'CVS-CT-BK-39', N'Đen', '39', 1500000, 30, '/uploads/19.jpg', 1),
(5, 'CVS-CT-BK-40', N'Đen', '40', 1500000, 28, '/uploads/20.jpg', 1),
(5, 'CVS-CT-WH-40', N'Trắng', '40', 1500000, 25, '/uploads/21.jpg', 1),
(5, 'CVS-CT-RD-41', N'Đỏ', '41', 1500000, 20, '/uploads/22.jpg', 1),
-- Puma RS-X
(6, 'PUMA-RSX-MX-40', N'Multi Color', '40', 2800000, 12, '/uploads/23.jpg', 1),
(6, 'PUMA-RSX-BK-41', N'Đen', '41', 2800000, 10, '/uploads/24.jpg', 1),
(6, 'PUMA-RSX-WH-42', N'Trắng', '42', 2800000, 8, '/uploads/25.jpg', 1),
-- New Balance 574
(7, 'NB-574-GR-40', N'Xám', '40', 2600000, 15, '/uploads/26.jpg', 1),
(7, 'NB-574-BL-41', N'Xanh Navy', '41', 2600000, 12, '/uploads/27.jpg', 1),
(7, 'NB-574-BK-42', N'Đen', '42', 2600000, 10, '/uploads/28.jpg', 1),
-- Vans Old Skool
(8, 'VANS-OS-BK-39', N'Đen/Trắng', '39', 1800000, 22, '/uploads/29.jpg', 1),
(8, 'VANS-OS-BK-40', N'Đen/Trắng', '40', 1800000, 25, '/uploads/30.jpg', 1),
(8, 'VANS-OS-BK-41', N'Đen/Trắng', '41', 1800000, 20, '/uploads/31.jpg', 1),
-- Nike Air Jordan 1
(9, 'NIKE-AJ1-BR-40', N'Bred', '40', 5500000, 5, '/uploads/32.jpg', 1),
(9, 'NIKE-AJ1-BR-41', N'Bred', '41', 5500000, 4, '/uploads/33.jpg', 1),
(9, 'NIKE-AJ1-CH-42', N'Chicago', '42', 5500000, 3, '/uploads/34.jpg', 1),
-- Adidas Superstar
(10, 'ADI-SUPER-WH-40', N'Trắng/Đen', '40', 2300000, 18, '/uploads/35.jpg', 1),
(10, 'ADI-SUPER-WH-41', N'Trắng/Đen', '41', 2300000, 20, '/uploads/36.jpg', 1),
(10, 'ADI-SUPER-BK-42', N'Đen', '42', 2300000, 15, '/uploads/37.jpg', 1),
-- Nike React Infinity
(11, 'NIKE-RI-BK-40', N'Đen', '40', 3800000, 10, '/uploads/38.jpg', 1),
(11, 'NIKE-RI-WH-41', N'Trắng', '41', 3800000, 8, '/uploads/39.jpg', 1),
-- Puma Suede Classic
(12, 'PUMA-SD-BK-40', N'Đen', '40', 2000000, 15, '/uploads/40.jpg', 1),
(12, 'PUMA-SD-BL-41', N'Xanh Navy', '41', 2000000, 12, '/uploads/41.jpg', 1),
-- Reebok Classic Leather
(13, 'RBK-CL-WH-40', N'Trắng', '40', 2100000, 18, '/uploads/42.jpg', 1),
(13, 'RBK-CL-BK-41', N'Đen', '41', 2100000, 15, '/uploads/43.jpg', 1),
-- New Balance 990v5
(14, 'NB-990-GR-41', N'Xám', '41', 5200000, 6, '/uploads/44.jpg', 1),
(14, 'NB-990-BK-42', N'Đen', '42', 5200000, 5, '/uploads/45.jpg', 1),
-- Nike Pegasus 39
(15, 'NIKE-PG39-BK-40', N'Đen', '40', 3200000, 12, '/uploads/46.jpg', 1),
(15, 'NIKE-PG39-BL-41', N'Xanh Blue', '41', 3200000, 10, '/uploads/47.jpg', 1),
-- Adidas NMD R1
(16, 'ADI-NMD-BK-40', N'Đen', '40', 3600000, 8, '/uploads/48.jpg', 1),
(16, 'ADI-NMD-WH-41', N'Trắng', '41', 3600000, 10, '/uploads/49.jpg', 1),
-- Converse Chuck 70
(17, 'CVS-C70-BK-40', N'Đen', '40', 2000000, 15, '/uploads/50.jpg', 1),
(17, 'CVS-C70-WH-41', N'Trắng', '41', 2000000, 18, '/uploads/51.jpg', 1),
-- Asics Gel-Kayano 29
(18, 'ASC-GK29-BK-41', N'Đen', '41', 4200000, 7, '/uploads/52.jpg', 1),
(18, 'ASC-GK29-BL-42', N'Xanh Blue', '42', 4200000, 6, '/uploads/53.jpg', 1),
-- Nike Blazer Mid 77
(19, 'NIKE-BM77-WH-40', N'Trắng', '40', 2700000, 12, '/uploads/54.jpg', 1),
(19, 'NIKE-BM77-BK-41', N'Đen', '41', 2700000, 10, '/uploads/55.jpg', 1),
-- Adidas Samba
(20, 'ADI-SB-BK-40', N'Đen/Trắng', '40', 2400000, 15, '/uploads/56.jpg', 1),
(20, 'ADI-SB-BK-41', N'Đen/Trắng', '41', 2400000, 18, '/uploads/57.jpg', 1),
-- Vans Authentic
(21, 'VANS-AU-BK-39', N'Đen', '39', 1600000, 20, '/uploads/58.jpg', 1),
(21, 'VANS-AU-WH-40', N'Trắng', '40', 1600000, 22, '/uploads/59.jpg', 1),
-- Puma Cali
(22, 'PUMA-CL-WH-36', N'Trắng', '36', 2500000, 15, '/uploads/60.jpg', 1),
(22, 'PUMA-CL-BK-37', N'Đen', '37', 2500000, 12, '/uploads/61.jpg', 1),
-- Under Armour HOVR
(23, 'UA-HV-BK-41', N'Đen', '41', 3400000, 8, '/uploads/62.jpg', 1),
(23, 'UA-HV-GR-42', N'Xám', '42', 3400000, 7, '/uploads/63.jpg', 1),
-- Fila Disruptor II
(24, 'FILA-DS-WH-38', N'Trắng', '38', 2200000, 18, '/uploads/64.jpg', 1),
(24, 'FILA-DS-BK-39', N'Đen', '39', 2200000, 15, '/uploads/65.jpg', 1),
-- Nike Dunk Low
(25, 'NIKE-DK-PD-40', N'Panda', '40', 3000000, 10, '/uploads/66.jpg', 1),
(25, 'NIKE-DK-RD-41', N'Đỏ/Trắng', '41', 3000000, 8, '/uploads/67.jpg', 1);
GO

-- Hình ảnh chi tiết (120+ ảnh - mỗi sản phẩm 4-6 ảnh)
INSERT INTO HinhAnhChiTiet (MaChiTiet, DuongDan, LaAnhChinh, ThuTu) VALUES
-- Nike Air Force 1 White
(1, '/uploads/1.jpg', 1, 1),
(1, '/uploads/1.2.jpg', 0, 2),
(1, '/uploads/1.3.jpg', 0, 3),
(1, '/uploads/1.4.jpg', 0, 4),
-- Nike Air Force 1 Black
(4, '/uploads/4.jpg', 1, 1),
(4, '/uploads/4.2.jpg', 0, 2),
(4, '/uploads/4.3.jpg', 0, 3),
-- Adidas Ultraboost Black
(6, '/uploads/6.jpg', 1, 1),
(6, '/uploads/6.2.jpg', 0, 2),
(6, '/uploads/6.3.jpg', 0, 3),
(6, '/uploads/6.4.jpg', 0, 4),
-- Adidas Ultraboost White
(9, '/uploads/9.jpg', 1, 1),
(9, '/uploads/9.2.jpg', 0, 2),
-- Nike Air Max 270
(11, '/uploads/11.jpg', 1, 1),
(11, '/uploads/11.2.jpg', 0, 2),
(11, '/uploads/11.3.jpg', 0, 3),
(12, '/uploads/12.jpg', 1, 1),
(12, '/uploads/12.2.jpg', 0, 2),
-- Adidas Stan Smith
(15, '/uploads/15.jpg', 1, 1),
(15, '/uploads/15.2.jpg', 0, 2),
(15, '/uploads/15.3.jpg', 0, 3),
-- Converse Chuck Taylor
(19, '/uploads/19.jpg', 1, 1),
(19, '/uploads/19.2.jpg', 0, 2),
(21, '/uploads/21.jpg', 1, 1),
-- Nike Air Jordan 1
(31, '/uploads/31.jpg', 1, 1),
(31, '/uploads/31.2.jpg', 0, 2),
(31, '/uploads/31.3.jpg', 0, 3),
(31, '/uploads/31.4.jpg', 0, 4),
(31, '/uploads/31.5.jpg', 0, 5);
GO

-- Người dùng (25 người dùng)
INSERT INTO NguoiDung (TenDangNhap, MatKhau, Email, HoTen, SoDienThoai, DiaChi, VaiTro, TrangThai) VALUES
('admin', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'admin@stepupshoes.com', N'Quản Trị Viên', '0901234567', N'123 Nguyễn Huệ, Q1, TP.HCM', 'quan_tri', 1),
('nhanvien01', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'nhanvien01@stepupshoes.com', N'Nguyễn Văn An', '0902345678', N'456 Lê Lợi, Q1, TP.HCM', 'nhan_vien', 1),
('nhanvien02', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'nhanvien02@stepupshoes.com', N'Trần Thị Bình', '0903456789', N'789 Hai Bà Trưng, Q3, TP.HCM', 'nhan_vien', 1),
('customer01', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'nguyenvana@gmail.com', N'Nguyễn Văn A', '0904567890', N'12 Lê Văn Việt, Q9, TP.HCM', 'khach_hang', 1),
('customer02', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'tranthib@gmail.com', N'Trần Thị B', '0905678901', N'34 Võ Văn Ngân, Thủ Đức, TP.HCM', 'khach_hang', 1),
('customer03', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'levanc@gmail.com', N'Lê Văn C', '0906789012', N'56 Nguyễn Thị Minh Khai, Q3, TP.HCM', 'khach_hang', 1),
('customer04', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'phamthid@gmail.com', N'Phạm Thị D', '0907890123', N'78 Điện Biên Phủ, Q10, TP.HCM', 'khach_hang', 1),
('customer05', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'hoangvane@gmail.com', N'Hoàng Văn E', '0908901234', N'90 Cách Mạng Tháng 8, Q10, TP.HCM', 'khach_hang', 1),
('customer06', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'vuthif@gmail.com', N'Vũ Thị F', '0909012345', N'12 Trần Hưng Đạo, Q5, TP.HCM', 'khach_hang', 1),
('customer07', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'dovanh@gmail.com', N'Đỗ Văn H', '0900123456', N'34 Nguyễn Trãi, Q5, TP.HCM', 'khach_hang', 1),
('customer08', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'buithii@gmail.com', N'Bùi Thị I', '0911234567', N'56 Lý Thường Kiệt, Q11, TP.HCM', 'khach_hang', 1),
('customer09', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'dangvank@gmail.com', N'Đặng Văn K', '0912345678', N'78 Sư Vạn Hạnh, Q10, TP.HCM', 'khach_hang', 1),
('customer10', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'ngothil@gmail.com', N'Ngô Thị L', '0913456789', N'90 Phan Đăng Lưu, Phú Nhuận, TP.HCM', 'khach_hang', 1),
('customer11', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'dinh.van.m@gmail.com', N'Đinh Văn M', '0914567890', N'12 Hoàng Văn Thụ, Tân Bình, TP.HCM', 'khach_hang', 1),
('customer12', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'lythin@gmail.com', N'Lý Thị N', '0915678901', N'34 Cộng Hòa, Tân Bình, TP.HCM', 'khach_hang', 1),
('customer13', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'maivano@gmail.com', N'Mai Văn O', '0916789012', N'56 Trường Chinh, Tân Bình, TP.HCM', 'khach_hang', 1),
('customer14', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'truongthip@gmail.com', N'Trương Thị P', '0917890123', N'78 Lạc Long Quân, Q11, TP.HCM', 'khach_hang', 1),
('customer15', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'phanvanq@gmail.com', N'Phan Văn Q', '0918901234', N'90 Âu Cơ, Tân Phú, TP.HCM', 'khach_hang', 1),
('customer16', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'tathir@gmail.com', N'Tạ Thị R', '0919012345', N'12 Lê Đức Thọ, Gò Vấp, TP.HCM', 'khach_hang', 1),
('customer17', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'tovans@gmail.com', N'Tô Văn S', '0920123456', N'34 Quang Trung, Gò Vấp, TP.HCM', 'khach_hang', 1),
('customer18', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'dothit@gmail.com', N'Đỗ Thị T', '0921234567', N'56 Nguyễn Oanh, Gò Vấp, TP.HCM', 'khach_hang', 1),
('customer19', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'kimvanu@gmail.com', N'Kim Văn U', '0922345678', N'78 Phạm Văn Đồng, Bình Thạnh, TP.HCM', 'khach_hang', 1),
('customer20', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'lothiv@gmail.com', N'Lô Thị V', '0923456789', N'90 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM', 'khach_hang', 1),
('customer21', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'luuvanw@gmail.com', N'Lưu Văn W', '0924567890', N'12 D2, Bình Thạnh, TP.HCM', 'khach_hang', 1),
('customer22', '$2a$10$lDdj3Ba/7e0SmT4jsT0ADeJHi4WAAPt1ohbS6CX.uoR1V6WwDOlbK', 'macthix@gmail.com', N'Mạc Thị X', '0925678901', N'34 Nguyễn Xí, Bình Thạnh, TP.HCM', 'khach_hang', 1);
GO

-- Giỏ hàng (20 mục giỏ hàng)
INSERT INTO GioHang (MaNguoiDung, MaChiTiet, SoLuong, NgayThem) VALUES
(4, 1, 1, DATEADD(hour, -2, GETDATE())),  -- customer01: Nike AF1 White
(4, 6, 1, DATEADD(hour, -1, GETDATE())),  -- customer01: Adidas Ultraboost
(5, 15, 2, DATEADD(day, -1, GETDATE())),  -- customer02: Stan Smith
(5, 19, 1, DATEADD(day, -1, GETDATE())),  -- customer02: Converse Black
(6, 34, 1, DATEADD(hour, -5, GETDATE())),  -- customer03: Air Jordan 1
(7, 11, 1, DATEADD(day, -2, GETDATE())),  -- customer04: Air Max 270
(8, 31, 2, DATEADD(hour, -3, GETDATE())),  -- customer05: Vans Old Skool
(9, 36, 1, DATEADD(day, -1, GETDATE())),  -- customer06: Adidas Superstar
(10, 4, 1, DATEADD(hour, -4, GETDATE())), -- customer07: Nike AF1 Black
(11, 15, 1, DATEADD(hour, -6, GETDATE())), -- customer08: Stan Smith
(12, 53, 1, DATEADD(day, -3, GETDATE())),  -- customer09: Nike Blazer
(13, 25, 2, DATEADD(hour, -8, GETDATE())),  -- customer10: Puma RS-X
(14, 39, 1, DATEADD(day, -2, GETDATE())),  -- customer11: Nike React
(15, 49, 1, DATEADD(hour, -10, GETDATE())), -- customer12: Adidas NMD
(16, 2, 1, DATEADD(day, -1, GETDATE())),   -- customer13: Nike AF1 White
(17, 61, 1, DATEADD(hour, -12, GETDATE())), -- customer14: Vans Authentic
(18, 28, 1, DATEADD(day, -4, GETDATE())),  -- customer15: New Balance 574
(19, 22, 1, DATEADD(hour, -15, GETDATE())), -- customer16: Converse Chuck Red
(20, 16, 2, DATEADD(day, -2, GETDATE())),  -- customer17: Stan Smith
(21, 31, 1, DATEADD(hour, -20, GETDATE())); -- customer18: Vans Old Skool
GO

-- Voucher (20 voucher)
INSERT INTO Voucher (Code, MoTa, LoaiGiam, GiaTriGiam, GiamToiDa, GiaTriToiThieu, SoLuong, SoLuongDaDung, NgayBatDau, NgayKetThuc, TrangThai) VALUES
('WELCOME10', N'Giảm 10% cho khách hàng mới', 'phan_tram', 10, 200000, 500000, 100, 35, '2024-01-01', '2026-12-31', 1),
('SUMMER50K', N'Giảm 50K cho đơn hàng mùa hè', 'so_tien', 50000, NULL, 1000000, 200, 120, '2024-06-01', '2026-08-31', 1),
('FREESHIP', N'Miễn phí vận chuyển', 'so_tien', 30000, NULL, 0, 500, 250, '2024-01-01', '2026-12-31', 1),
('VIP20', N'Giảm 20% cho khách VIP', 'phan_tram', 20, 500000, 2000000, 50, 15, '2024-01-01', '2026-12-31', 1),
('NIKE100K', N'Giảm 100K cho sản phẩm Nike', 'so_tien', 100000, NULL, 1500000, 80, 42, '2024-03-01', '2026-06-30', 1),
('ADIDAS15', N'Giảm 15% cho sản phẩm Adidas', 'phan_tram', 15, 300000, 1000000, 100, 55, '2024-03-01', '2026-06-30', 1),
('FLASH200K', N'Flash sale giảm 200K', 'so_tien', 200000, NULL, 3000000, 30, 28, '2024-05-01', '2026-05-31', 1),
('MEMBER25', N'Giảm 25% cho thành viên', 'phan_tram', 25, 1000000, 3000000, 100, 48, '2024-01-01', '2026-12-31', 1),
('NEWYEAR', N'Giảm giá Tết Nguyên Đán', 'phan_tram', 30, 500000, 1500000, 200, 180, '2024-01-20', '2026-02-15', 1),
('STUDENT10', N'Giảm 10% cho sinh viên', 'phan_tram', 10, 150000, 500000, 300, 120, '2024-01-01', '2026-12-31', 1),
('BRANDNEW', N'Giảm 5% cho sản phẩm mới', 'phan_tram', 5, 100000, 0, 500, 200, '2024-01-01', '2026-12-31', 1),
('MEGA300K', N'Mega sale giảm 300K', 'so_tien', 300000, NULL, 5000000, 20, 18, '2024-11-11', '2026-11-11', 1),
('LOYAL30', N'Giảm 30% khách hàng thân thiết', 'phan_tram', 30, 800000, 2500000, 50, 22, '2024-01-01', '2026-12-31', 1),
('WEEKEND20K', N'Giảm 20K cuối tuần', 'so_tien', 20000, NULL, 500000, 1000, 450, '2024-01-01', '2026-12-31', 1),
('BIRTHDAY50', N'Giảm 50K sinh nhật', 'so_tien', 50000, NULL, 800000, 200, 88, '2024-01-01', '2026-12-31', 1),
('COMEBACK15', N'Giảm 15% khách hàng quay lại', 'phan_tram', 15, 250000, 1000000, 150, 65, '2024-01-01', '2026-12-31', 1),
('XMAS100K', N'Giảm 100K Giáng Sinh', 'so_tien', 100000, NULL, 1500000, 100, 78, '2024-12-15', '2025-12-25', 0),
('SPORT25', N'Giảm 25% giày thể thao', 'phan_tram', 25, 600000, 2000000, 80, 45, '2024-01-01', '2026-06-30', 1),
('APP10K', N'Giảm 10K đơn đầu trên App', 'so_tien', 10000, NULL, 300000, 500, 320, '2024-01-01', '2026-12-31', 1),
('SUPERSALE40', N'Super sale giảm 40%', 'phan_tram', 40, 1500000, 4000000, 25, 20, '2024-12-12', '2024-12-12', 0);
GO

-- Đơn hàng (25 đơn hàng)
INSERT INTO DonHang (MaNguoiDung, TongTien, PhiVanChuyen, GiamGia, ThanhTien, TrangThaiDonHang, TrangThaiThanhToan, PhuongThucThanhToan, LoaiDonHang, DiaChiGiaoHang, SoDienThoaiNhan, NguoiNhan, GhiChu, NgayDatHang) VALUES
(4, 2500000, 30000, 250000, 2280000, 'hoan_thanh', 'da_thanh_toan', 'chuyen_khoan', 'online', N'12 Lê Văn Việt, Q9, TP.HCM', '0904567890', N'Nguyễn Văn A', N'Giao giờ hành chính', DATEADD(day, -30, GETDATE())),
(5, 4400000, 30000, 0, 4430000, 'hoan_thanh', 'da_thanh_toan', 'the_tin_dung', 'online', N'34 Võ Văn Ngân, Thủ Đức, TP.HCM', '0905678901', N'Trần Thị B', NULL, DATEADD(day, -28, GETDATE())),
(6, 5500000, 0, 550000, 4950000, 'hoan_thanh', 'da_thanh_toan', 'vi_dien_tu', 'online', N'56 Nguyễn Thị Minh Khai, Q3, TP.HCM', '0906789012', N'Lê Văn C', N'Không gọi trước khi giao', DATEADD(day, -25, GETDATE())),
(7, 6600000, 30000, 0, 6630000, 'da_giao_hang', 'da_thanh_toan', 'chuyen_khoan', 'online', N'78 Điện Biên Phủ, Q10, TP.HCM', '0907890123', N'Phạm Thị D', NULL, DATEADD(day, -20, GETDATE())),
(8, 1800000, 30000, 50000, 1780000, 'hoan_thanh', 'da_thanh_toan', 'tien_mat', 'online', N'90 Cách Mạng Tháng 8, Q10, TP.HCM', '0908901234', N'Hoàng Văn E', NULL, DATEADD(day, -18, GETDATE())),
(9, 2300000, 30000, 0, 2330000, 'hoan_thanh', 'da_thanh_toan', 'chuyen_khoan', 'online', N'12 Trần Hưng Đạo, Q5, TP.HCM', '0909012345', N'Vũ Thị F', NULL, DATEADD(day, -15, GETDATE())),
(10, 7800000, 0, 780000, 7020000, 'dang_giao_hang', 'da_thanh_toan', 'the_tin_dung', 'online', N'34 Nguyễn Trãi, Q5, TP.HCM', '0900123456', N'Đỗ Văn H', N'Giao trước 5h chiều', DATEADD(day, -12, GETDATE())),
(11, 4500000, 30000, 100000, 4430000, 'hoan_thanh', 'da_thanh_toan', 'vi_dien_tu', 'online', N'56 Lý Thường Kiệt, Q11, TP.HCM', '0911234567', N'Bùi Thị I', NULL, DATEADD(day, -10, GETDATE())),
(12, 2000000, 30000, 200000, 1830000, 'hoan_thanh', 'da_thanh_toan', 'chuyen_khoan', 'online', N'78 Sư Vạn Hạnh, Q10, TP.HCM', '0912345678', N'Đặng Văn K', NULL, DATEADD(day, -8, GETDATE())),
(13, 5400000, 30000, 0, 5430000, 'cho_xac_nhan', 'chua_thanh_toan', 'tien_mat', 'online', N'90 Phan Đăng Lưu, Phú Nhuận, TP.HCM', '0913456789', N'Ngô Thị L', NULL, DATEADD(day, -5, GETDATE())),
(14, 2600000, 30000, 50000, 2580000, 'cho_xac_nhan', 'chua_thanh_toan', 'chuyen_khoan', 'online', N'12 Hoàng Văn Thụ, Tân Bình, TP.HCM', '0914567890', N'Đinh Văn M', NULL, DATEADD(day, -3, GETDATE())),
(15, 3500000, 0, 350000, 3150000, 'hoan_thanh', 'da_thanh_toan', 'the_tin_dung', 'online', N'34 Cộng Hòa, Tân Bình, TP.HCM', '0915678901', N'Lý Thị N', N'Để ở bảo vệ nếu không có người', DATEADD(day, -22, GETDATE())),
(16, 2100000, 30000, 0, 2130000, 'hoan_thanh', 'da_thanh_toan', 'vi_dien_tu', 'online', N'56 Trường Chinh, Tân Bình, TP.HCM', '0916789012', N'Mai Văn O', NULL, DATEADD(day, -19, GETDATE())),
(17, 1500000, 30000, 150000, 1380000, 'huy', 'hoan_tien', 'chuyen_khoan', 'online', N'78 Lạc Long Quân, Q11, TP.HCM', '0917890123', N'Trương Thị P', N'Khách yêu cầu hủy', DATEADD(day, -16, GETDATE())),
(18, 9000000, 0, 900000, 8100000, 'hoan_thanh', 'da_thanh_toan', 'the_tin_dung', 'online', N'90 Âu Cơ, Tân Phú, TP.HCM', '0918901234', N'Phan Văn Q', NULL, DATEADD(day, -14, GETDATE())),
(19, 3000000, 30000, 0, 3030000, 'hoan_thanh', 'da_thanh_toan', 'tien_mat', 'tai_quay', N'Mua tại cửa hàng', '0919012345', N'Tạ Thị R', NULL, DATEADD(day, -11, GETDATE())),
(20, 2500000, 30000, 250000, 2280000, 'hoan_thanh', 'da_thanh_toan', 'tien_mat', 'tai_quay', N'Mua tại cửa hàng', '0920123456', N'Tô Văn S', NULL, DATEADD(day, -9, GETDATE())),
(21, 4000000, 30000, 100000, 3930000, 'dang_giao_hang', 'da_thanh_toan', 'chuyen_khoan', 'online', N'56 Nguyễn Oanh, Gò Vấp, TP.HCM', '0921234567', N'Đỗ Thị T', NULL, DATEADD(day, -6, GETDATE())),
(22, 7200000, 30000, 0, 7230000, 'chuan_bi_hang', 'da_thanh_toan', 'the_tin_dung', 'online', N'78 Phạm Văn Đồng, Bình Thạnh, TP.HCM', '0922345678', N'Kim Văn U', NULL, DATEADD(day, -4, GETDATE())),
(23, 1800000, 30000, 50000, 1780000, 'cho_xac_nhan', 'chua_thanh_toan', 'tien_mat', 'online', N'90 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM', '0923456789', N'Lô Thị V', NULL, DATEADD(day, -2, GETDATE())),
(24, 5000000, 0, 500000, 4500000, 'hoan_thanh', 'da_thanh_toan', 'vi_dien_tu', 'online', N'12 D2, Bình Thạnh, TP.HCM', '0924567890', N'Lưu Văn W', NULL, DATEADD(day, -7, GETDATE())),
(25, 3600000, 30000, 0, 3630000, 'hoan_thanh', 'da_thanh_toan', 'chuyen_khoan', 'online', N'34 Nguyễn Xí, Bình Thạnh, TP.HCM', '0925678901', N'Mạc Thị X', NULL, DATEADD(day, -13, GETDATE())),
(4, 4500000, 30000, 0, 4530000, 'hoan_thanh', 'da_thanh_toan', 'the_tin_dung', 'online', N'12 Lê Văn Việt, Q9, TP.HCM', '0904567890', N'Nguyễn Văn A', NULL, DATEADD(day, -17, GETDATE())),
(5, 2200000, 30000, 220000, 2010000, 'hoan_thanh', 'da_thanh_toan', 'vi_dien_tu', 'online', N'34 Võ Văn Ngân, Thủ Đức, TP.HCM', '0905678901', N'Trần Thị B', NULL, DATEADD(day, -21, GETDATE())),
(6, 6000000, 30000, 100000, 5930000, 'hoan_thanh', 'da_thanh_toan', 'chuyen_khoan', 'online', N'56 Nguyễn Thị Minh Khai, Q3, TP.HCM', '0906789012', N'Lê Văn C', NULL, DATEADD(day, -24, GETDATE()));
GO

-- Chi tiết đơn hàng (60+ chi tiết)
INSERT INTO ChiTietDonHang (MaDonHang, MaChiTiet, SoLuong, DonGia, ThanhTien) VALUES
-- Đơn 1: Nike AF1 White
(1, 1, 1, 2500000, 2500000),
-- Đơn 2: 2 sản phẩm Adidas
(2, 6, 1, 4500000, 4500000),
(2, 15, 2, 2200000, 4400000),
-- Đơn 3: Air Jordan (VIP)
(3, 34, 1, 5500000, 5500000),
-- Đơn 4: 2 sản phẩm Nike
(4, 11, 1, 3500000, 3500000),
(4, 39, 1, 3200000, 3200000),
-- Đơn 5: Vans
(5, 31, 1, 1800000, 1800000),
-- Đơn 6: Adidas Superstar
(6, 36, 1, 2300000, 2300000),
-- Đơn 7: 3 đôi giày cao cấp
(7, 35, 1, 5500000, 5500000),
(7, 7, 1, 4500000, 4500000),
(7, 55, 1, 4200000, 4200000),
-- Đơn 8: Adidas Ultraboost
(8, 6, 1, 4500000, 4500000),
-- Đơn 9: Puma Suede
(9, 43, 1, 2000000, 2000000),
-- Đơn 10: New Balance 990
(10, 46, 2, 5200000, 10400000),
-- Đơn 11: Nike Pegasus
(11, 39, 1, 3200000, 3200000),
-- Đơn 12: Nike Air Max 270
(12, 11, 1, 3500000, 3500000),
-- Đơn 13: Reebok Classic
(13, 45, 1, 2100000, 2100000),
-- Đơn 14 (Hủy): Converse
(14, 19, 1, 1500000, 1500000),
-- Đơn 15: Air Jordan + Ultraboost
(15, 34, 1, 5500000, 5500000),
(15, 6, 1, 4500000, 4500000),
-- Đơn 16: Nike Dunk Low (tại quầy)
(16, 67, 1, 3000000, 3000000),
-- Đơn 17: Nike AF1 (tại quầy)
(17, 1, 1, 2500000, 2500000),
-- Đơn 18: Adidas NMD + Stan Smith
(18, 49, 1, 3600000, 3600000),
(18, 15, 1, 2200000, 2200000),
-- Đơn 19: New Balance + Puma
(19, 28, 1, 2600000, 2600000),
(19, 25, 1, 2800000, 2800000),
-- Đơn 20: Vans
(20, 31, 1, 1800000, 1800000),
-- Đơn 21: Under Armour + Puma Cali
(21, 63, 1, 3400000, 3400000),
(21, 61, 2, 2500000, 5000000),
-- Đơn 22: Nike Blazer
(22, 53, 1, 2700000, 2700000),
-- Đơn 23: Adidas Ultraboost
(23, 6, 1, 4500000, 4500000),
-- Đơn 24: Stan Smith x2
(24, 16, 2, 2200000, 4400000),
-- Đơn 25: Nike AF1 Black + Air Max
(25, 4, 1, 2500000, 2500000),
(25, 11, 1, 3500000, 3500000);
GO

-- Đánh giá sản phẩm (30 đánh giá)
INSERT INTO DanhGia (MaChiTiet, MaNguoiDung, Diem, NoiDung, TrangThai, NgayDanhGia) VALUES
(1, 4, 5, N'Giày rất đẹp, chất lượng tốt. Mình rất hài lòng!', 1, DATEADD(day, -27, GETDATE())),
(6, 5, 5, N'Giày êm chân, phù hợp chạy bộ. Sẽ ủng hộ shop tiếp!', 1, DATEADD(day, -25, GETDATE())),
(34, 6, 5, N'Air Jordan huyền thoại! Giá hợp lý, giao hàng nhanh', 1, DATEADD(day, -22, GETDATE())),
(11, 7, 4, N'Giày đẹp nhưng hơi chật. Nên lấy size lớn hơn 1 size', 1, DATEADD(day, -18, GETDATE())),
(31, 8, 5, N'Vans Old Skool classic, không bao giờ lỗi mốt', 1, DATEADD(day, -15, GETDATE())),
(36, 9, 5, N'Superstar đẹp quá! Phối đồ dễ dàng', 1, DATEADD(day, -12, GETDATE())),
(35, 10, 4, N'Chất lượng tốt nhưng giá hơi cao', 1, DATEADD(day, -10, GETDATE())),
(15, 4, 5, N'Stan Smith trắng rất đẹp và dễ phối đồ', 1, DATEADD(day, -20, GETDATE())),
(1, 25, 5, N'Mua lần 2 rồi, chất lượng ổn định', 1, DATEADD(day, -8, GETDATE())),
(6, 11, 5, N'Ultraboost êm nhất từng đi. Đáng đồng tiền!', 1, DATEADD(day, -7, GETDATE())),
(43, 12, 4, N'Puma Suede đẹp vintage. Hơi dễ bẩn', 1, DATEADD(day, -6, GETDATE())),
(46, 13, 5, N'New Balance 990 xứng đáng! Chất lượng cao cấp', 1, DATEADD(day, -5, GETDATE())),
(39, 14, 4, N'Pegasus tốt cho chạy bộ nhưng hơi nặng', 1, DATEADD(day, -4, GETDATE())),
(11, 15, 5, N'Air Max 270 đẹp mọi góc nhìn', 1, DATEADD(day, -19, GETDATE())),
(45, 16, 3, N'Reebok ổn nhưng không nổi bật', 1, DATEADD(day, -3, GETDATE())),
(34, 17, 5, N'Jordan 1 là huyền thoại! Must have!', 1, DATEADD(day, -11, GETDATE())),
(67, 18, 4, N'Nike Dunk Low đẹp, hơi khó mua', 1, DATEADD(day, -9, GETDATE())),
(49, 19, 5, N'NMD R1 rất thoải mái, boost đệm tốt', 1, DATEADD(day, -8, GETDATE())),
(15, 19, 5, N'Stan Smith không bao giờ lỗi thời', 1, DATEADD(day, -8, GETDATE())),
(28, 20, 4, N'New Balance 574 tốt nhưng hơi rộng', 1, DATEADD(day, -7, GETDATE())),
(25, 20, 5, N'Puma RS-X màu đẹp, kiểu dáng bắt mắt', 1, DATEADD(day, -7, GETDATE())),
(31, 21, 5, N'Vans không bao giờ làm tôi thất vọng', 1, DATEADD(day, -5, GETDATE())),
(63, 22, 4, N'HOVR Phantom tốt cho chạy, hơi đắt', 1, DATEADD(day, -4, GETDATE())),
(53, 23, 5, N'Nike Blazer phong cách vintage cực đẹp', 1, DATEADD(day, -3, GETDATE())),
(6, 24, 5, N'Ultraboost lần thứ 3 mua. Quá tốt!', 1, DATEADD(day, -10, GETDATE())),
(16, 25, 4, N'Stan Smith size vừa, chất lượng tốt', 1, DATEADD(day, -6, GETDATE())),
(4, 10, 5, N'Nike Air Force màu đen sang trọng', 1, DATEADD(day, -2, GETDATE())),
(19, 4, 5, N'Converse Chuck Taylor cổ điển, tôi thích!', 1, DATEADD(day, -23, GETDATE())),
(36, 11, 4, N'Adidas Superstar icon của street style', 1, DATEADD(day, -1, GETDATE())),
(1, 12, 5, N'Nike AF1 trắng must have trong tủ giày!', 1, DATEADD(day, -1, GETDATE()));
GO

-- Lịch sử trạng thái đơn hàng (50+ bản ghi)
INSERT INTO LichSuTrangThaiDonHang (MaDonHang, TrangThaiCu, TrangThaiMoi, GhiChu, NguoiCapNhat, NgayCapNhat) VALUES
-- Đơn 1
(1, NULL, 'cho_xac_nhan', N'Khách đặt hàng', 4, DATEADD(day, -30, GETDATE())),
(1, 'cho_xac_nhan', 'chuan_bi_hang', N'Xác nhận đơn hàng', 2, DATEADD(day, -30, DATEADD(hour, 2, GETDATE()))),
(1, 'chuan_bi_hang', 'dang_giao_hang', N'Đơn hàng đang giao', 2, DATEADD(day, -29, GETDATE())),
(1, 'dang_giao_hang', 'da_giao_hang', N'Giao hàng thành công', 2, DATEADD(day, -28, GETDATE())),
(1, 'da_giao_hang', 'hoan_thanh', N'Hoàn thành đơn hàng', 1, DATEADD(day, -27, GETDATE())),
-- Đơn 2
(2, NULL, 'cho_xac_nhan', N'Khách đặt hàng', 5, DATEADD(day, -28, GETDATE())),
(2, 'cho_xac_nhan', 'chuan_bi_hang', N'Xác nhận đơn hàng', 2, DATEADD(day, -28, DATEADD(hour, 1, GETDATE()))),
(2, 'chuan_bi_hang', 'dang_giao_hang', N'Đơn hàng đang giao', 2, DATEADD(day, -27, GETDATE())),
(2, 'dang_giao_hang', 'da_giao_hang', N'Giao hàng thành công', 2, DATEADD(day, -26, GETDATE())),
(2, 'da_giao_hang', 'hoan_thanh', N'Hoàn thành đơn hàng', 1, DATEADD(day, -25, GETDATE())),
-- Đơn 3
(3, NULL, 'cho_xac_nhan', N'Khách đặt hàng', 6, DATEADD(day, -25, GETDATE())),
(3, 'cho_xac_nhan', 'chuan_bi_hang', N'Xác nhận đơn hàng VIP', 1, DATEADD(day, -25, DATEADD(hour, 1, GETDATE()))),
(3, 'chuan_bi_hang', 'dang_giao_hang', N'Ưu tiên giao hàng', 2, DATEADD(day, -24, GETDATE())),
(3, 'dang_giao_hang', 'da_giao_hang', N'Giao hàng thành công', 2, DATEADD(day, -23, GETDATE())),
(3, 'da_giao_hang', 'hoan_thanh', N'Hoàn thành đơn hàng', 1, DATEADD(day, -22, GETDATE())),
-- Đơn 4
(4, NULL, 'cho_xac_nhan', N'Khách đặt hàng', 7, DATEADD(day, -20, GETDATE())),
(4, 'cho_xac_nhan', 'chuan_bi_hang', N'Xác nhận đơn hàng', 2, DATEADD(day, -20, DATEADD(hour, 3, GETDATE()))),
(4, 'chuan_bi_hang', 'dang_giao_hang', N'Đơn hàng đang giao', 2, DATEADD(day, -19, GETDATE())),
(4, 'dang_giao_hang', 'da_giao_hang', N'Giao hàng thành công', 2, DATEADD(day, -18, GETDATE())),
-- Đơn 5
(5, NULL, 'cho_xac_nhan', N'Khách đặt hàng', 8, DATEADD(day, -18, GETDATE())),
(5, 'cho_xac_nhan', 'chuan_bi_hang', N'Xác nhận đơn hàng', 3, DATEADD(day, -17, GETDATE())),
(5, 'chuan_bi_hang', 'dang_giao_hang', N'Đơn hàng đang giao', 3, DATEADD(day, -16, GETDATE())),
(5, 'dang_giao_hang', 'da_giao_hang', N'Giao hàng thành công', 3, DATEADD(day, -15, GETDATE())),
(5, 'da_giao_hang', 'hoan_thanh', N'Hoàn thành', 1, DATEADD(day, -15, DATEADD(hour, 5, GETDATE()))),
-- Đơn 6
(6, NULL, 'cho_xac_nhan', N'Khách đặt hàng', 9, DATEADD(day, -15, GETDATE())),
(6, 'cho_xac_nhan', 'chuan_bi_hang', N'Xác nhận đơn hàng', 2, DATEADD(day, -14, GETDATE())),
(6, 'chuan_bi_hang', 'dang_giao_hang', N'Đơn hàng đang giao', 2, DATEADD(day, -13, GETDATE())),
(6, 'dang_giao_hang', 'da_giao_hang', N'Giao hàng thành công', 2, DATEADD(day, -12, GETDATE())),
(6, 'da_giao_hang', 'hoan_thanh', N'Hoàn thành', 1, DATEADD(day, -12, DATEADD(hour, 3, GETDATE()))),
-- Đơn 7 (đang giao)
(7, NULL, 'cho_xac_nhan', N'Khách đặt hàng', 10, DATEADD(day, -12, GETDATE())),
(7, 'cho_xac_nhan', 'chuan_bi_hang', N'Xác nhận đơn hàng', 2, DATEADD(day, -11, GETDATE())),
(7, 'chuan_bi_hang', 'dang_giao_hang', N'Đơn hàng đang giao', 2, DATEADD(day, -10, GETDATE())),
-- Đơn 8
(8, NULL, 'cho_xac_nhan', N'Khách đặt hàng', 11, DATEADD(day, -10, GETDATE())),
(8, 'cho_xac_nhan', 'chuan_bi_hang', N'Xác nhận đơn hàng', 3, DATEADD(day, -9, GETDATE())),
(8, 'chuan_bi_hang', 'dang_giao_hang', N'Đơn hàng đang giao', 3, DATEADD(day, -8, GETDATE())),
(8, 'dang_giao_hang', 'da_giao_hang', N'Giao hàng thành công', 3, DATEADD(day, -7, GETDATE())),
(8, 'da_giao_hang', 'hoan_thanh', N'Hoàn thành', 1, DATEADD(day, -7, DATEADD(hour, 2, GETDATE()))),
-- Đơn 9
(9, NULL, 'cho_xac_nhan', N'Khách đặt hàng', 12, DATEADD(day, -8, GETDATE())),
(9, 'cho_xac_nhan', 'chuan_bi_hang', N'Xác nhận đơn hàng', 2, DATEADD(day, -7, GETDATE())),
(9, 'chuan_bi_hang', 'dang_giao_hang', N'Đơn hàng đang giao', 2, DATEADD(day, -6, GETDATE())),
(9, 'dang_giao_hang', 'da_giao_hang', N'Giao hàng thành công', 2, DATEADD(day, -5, GETDATE())),
(9, 'da_giao_hang', 'hoan_thanh', N'Hoàn thành', 1, DATEADD(day, -5, DATEADD(hour, 4, GETDATE()))),
-- Đơn 10 (đang xác nhận)
(10, NULL, 'cho_xac_nhan', N'Khách đặt hàng', 13, DATEADD(day, -5, GETDATE())),
(10, 'cho_xac_nhan', 'chuan_bi_hang', N'Xác nhận đơn hàng', 2, DATEADD(day, -4, GETDATE())),
-- Đơn 11 (mới đặt)
(11, NULL, 'cho_xac_nhan', N'Khách đặt hàng', 14, DATEADD(day, -3, GETDATE())),
-- Đơn 14 (Hủy)
(14, NULL, 'cho_xac_nhan', N'Khách đặt hàng', 17, DATEADD(day, -16, GETDATE())),
(14, 'cho_xac_nhan', 'chuan_bi_hang', N'Xác nhận đơn hàng', 2, DATEADD(day, -15, GETDATE())),
(14, 'chuan_bi_hang', 'huy', N'Khách yêu cầu hủy đơn', 2, DATEADD(day, -14, GETDATE())),
-- Đơn 18 (đang giao)
(18, NULL, 'cho_xac_nhan', N'Khách đặt hàng', 22, DATEADD(day, -6, GETDATE())),
(18, 'cho_xac_nhan', 'chuan_bi_hang', N'Xác nhận đơn hàng', 3, DATEADD(day, -5, GETDATE())),
(18, 'chuan_bi_hang', 'dang_giao_hang', N'Đơn hàng đang giao', 3, DATEADD(day, -4, GETDATE()));
GO

-- Lịch sử sử dụng voucher (25 bản ghi)
INSERT INTO LichSuVoucher (MaVoucher, MaDonHang, MaNguoiDung, GiaTriGiam, NgaySuDung) VALUES
(1, 1, 4, 250000, DATEADD(day, -30, GETDATE())),        -- WELCOME10
(4, 3, 6, 550000, DATEADD(day, -25, GETDATE())),        -- VIP20
(2, 5, 8, 50000, DATEADD(day, -18, GETDATE())),         -- SUMMER50K
(8, 7, 10, 780000, DATEADD(day, -12, GETDATE())),       -- MEMBER25
(5, 8, 11, 100000, DATEADD(day, -10, GETDATE())),       -- NIKE100K
(1, 9, 12, 200000, DATEADD(day, -8, GETDATE())),        -- WELCOME10
(4, 12, 15, 350000, DATEADD(day, -22, GETDATE())),      -- VIP20
(1, 14, 17, 150000, DATEADD(day, -16, GETDATE())),      -- WELCOME10 (đơn hủy)
(8, 15, 18, 900000, DATEADD(day, -14, GETDATE())),      -- MEMBER25
(1, 17, 20, 250000, DATEADD(day, -9, GETDATE())),       -- WELCOME10
(5, 18, 21, 100000, DATEADD(day, -6, GETDATE())),       -- NIKE100K
(2, 20, 23, 50000, DATEADD(day, -2, GETDATE())),        -- SUMMER50K
(8, 21, 24, 500000, DATEADD(day, -7, GETDATE())),       -- MEMBER25
(1, 24, 5, 220000, DATEADD(day, -21, GETDATE())),       -- WELCOME10
(5, 25, 6, 100000, DATEADD(day, -24, GETDATE())),       -- NIKE100K
(6, 2, 5, 0, DATEADD(day, -28, GETDATE())),             -- ADIDAS15 (không đủ điều kiện)
(10, 4, 7, 0, DATEADD(day, -20, GETDATE())),            -- STUDENT10
(14, 6, 9, 0, DATEADD(day, -15, GETDATE())),            -- WEEKEND20K
(3, 12, 15, 30000, DATEADD(day, -22, GETDATE())),       -- FREESHIP
(3, 18, 21, 30000, DATEADD(day, -6, GETDATE())),        -- FREESHIP
(15, 19, 22, 50000, DATEADD(day, -4, GETDATE())),       -- BIRTHDAY50
(11, 22, 25, 0, DATEADD(day, -13, GETDATE())),          -- BRANDNEW
(16, 23, 4, 0, DATEADD(day, -17, GETDATE())),           -- COMEBACK15
(18, 3, 6, 0, DATEADD(day, -25, GETDATE())),            -- SPORT25
(19, 1, 4, 0, DATEADD(day, -30, GETDATE()));            -- APP10K
GO

