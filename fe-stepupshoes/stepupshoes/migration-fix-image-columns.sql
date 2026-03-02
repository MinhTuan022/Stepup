

USE StepUpShoesDB;
GO

ALTER TABLE ChiTietSanPham
ALTER COLUMN HinhAnhChinh NVARCHAR(MAX);
GO

ALTER TABLE HinhAnhChiTiet
ALTER COLUMN DuongDan NVARCHAR(MAX) NOT NULL;
GO

PRINT 'Migration completed successfully! Image columns now support base64 encoding.';
GO
