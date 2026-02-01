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
    HinhAnhChinh NVARCHAR(255),
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
    DuongDan NVARCHAR(255) NOT NULL,
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
            'dat_hang', 'xac_nhan', 'dang_giao', 'da_giao', 'huy', 'hoan_thanh'
        ))
        DEFAULT 'dat_hang',
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

-- Danh mục
INSERT INTO DanhMuc (TenDanhMuc) VALUES
(N'Sneaker'),
(N'Sandal');
GO

-- Sản phẩm
INSERT INTO SanPham (TenSanPham, ThuongHieu, MaDanhMuc, GiaCoBan, MoTa)
VALUES
(N'Nike Air Force 1', N'Nike', 1, 2000000, N'Mau giay huyenthoai cua Nike'),
(N'Adidas Ultraboost', N'Adidas', 1, 2500000, N'Giay chay bo cao cap');
GO

-- Chi tiết sản phẩm
INSERT INTO ChiTietSanPham (MaSanPham, MaSKU, MauSac, Size, GiaBan, SoLuongTon, HinhAnhChinh)
VALUES
(1, 'NIKE-AF1-WH-40', N'Trang', '40', 2000000, 10, '/images/af1-white-40.jpg'),
(1, 'NIKE-AF1-BL-41', N'Den', '41', 2050000, 8, '/images/af1-black-41.jpg'),
(2, 'ADI-UB-BL-42', N'Den', '42', 2500000, 12, '/images/ub-black-42.jpg');
GO

-- Người dùng mẫu
INSERT INTO NguoiDung (TenDangNhap, MatKhau, Email, HoTen, VaiTro)
VALUES
('admin', '123456', 'admin@store.com', N'Quan tri vien', 'quan_tri'),
('staff1', '123456', 'staff1@store.com', N'Nhan vien A', 'nhan_vien'),
('guest', 'guest', 'guest@example.com', N'Khach vang lai', 'khach_hang');
GO
