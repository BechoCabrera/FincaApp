-- Migration script: add missing columns to AnimalMovimientos table
-- Generated: 2026-03-13
-- WARNING: Review and backup your database before executing.

SET NOCOUNT ON;
GO

BEGIN TRANSACTION;
SET XACT_ABORT ON;

-- 1) Add FechaMovimiento (if missing)
IF COL_LENGTH('dbo.AnimalMovimientos','FechaMovimiento') IS NULL
BEGIN
    ALTER TABLE dbo.AnimalMovimientos
    ADD FechaMovimiento DATETIME2 NULL;
    PRINT 'Added column FechaMovimiento (NULL) to dbo.AnimalMovimientos.';
END
ELSE
    PRINT 'Column FechaMovimiento already exists.';
GO

-- 2) Add FincaOrigenId (if missing)
IF COL_LENGTH('dbo.AnimalMovimientos','FincaOrigenId') IS NULL
BEGIN
    ALTER TABLE dbo.AnimalMovimientos
    ADD FincaOrigenId UNIQUEIDENTIFIER NULL;
    PRINT 'Added column FincaOrigenId (NULL) to dbo.AnimalMovimientos.';
END
ELSE
    PRINT 'Column FincaOrigenId already exists.';
GO

-- 3) Add FincaDestinoId (if missing)
IF COL_LENGTH('dbo.AnimalMovimientos','FincaDestinoId') IS NULL
BEGIN
    ALTER TABLE dbo.AnimalMovimientos
    ADD FincaDestinoId UNIQUEIDENTIFIER NULL;
    PRINT 'Added column FincaDestinoId (NULL) to dbo.AnimalMovimientos.';
END
ELSE
    PRINT 'Column FincaDestinoId already exists.';
GO

-- 4) Populate FechaMovimiento for existing rows when null
-- Prefer to use CreatedAt if available, otherwise use current UTC
IF COL_LENGTH('dbo.AnimalMovimientos','CreatedAt') IS NOT NULL
BEGIN
    UPDATE dbo.AnimalMovimientos
    SET FechaMovimiento = COALESCE(FechaMovimiento, CreatedAt)
    WHERE FechaMovimiento IS NULL;
    PRINT 'Populated FechaMovimiento from CreatedAt where NULL.';
END
ELSE
BEGIN
    UPDATE dbo.AnimalMovimientos
    SET FechaMovimiento = COALESCE(FechaMovimiento, SYSUTCDATETIME())
    WHERE FechaMovimiento IS NULL;
    PRINT 'Populated FechaMovimiento with SYSUTCDATETIME() where NULL.';
END
GO

-- 5) Populate FincaOrigenId/FincaDestinoId with Guid.Empty where null to allow NOT NULL migration
UPDATE dbo.AnimalMovimientos
SET FincaOrigenId = COALESCE(FincaOrigenId, '00000000-0000-0000-0000-000000000000'),
    FincaDestinoId = COALESCE(FincaDestinoId, '00000000-0000-0000-0000-000000000000')
WHERE FincaOrigenId IS NULL OR FincaDestinoId IS NULL;
PRINT 'Populated FincaOrigenId/FincaDestinoId with Guid.Empty where NULL.';
GO

-- 6) Alter columns to NOT NULL (optional)
-- Only run if you are sure no NULLs remain and you want stricter schema
ALTER TABLE dbo.AnimalMovimientos
ALTER COLUMN FechaMovimiento DATETIME2 NOT NULL;
PRINT 'Altered FechaMovimiento to NOT NULL.';
GO

ALTER TABLE dbo.AnimalMovimientos
ALTER COLUMN FincaOrigenId UNIQUEIDENTIFIER NOT NULL;
PRINT 'Altered FincaOrigenId to NOT NULL.';
GO

ALTER TABLE dbo.AnimalMovimientos
ALTER COLUMN FincaDestinoId UNIQUEIDENTIFIER NOT NULL;
PRINT 'Altered FincaDestinoId to NOT NULL.';
GO

-- 7) Add index to improve timeline queries (if not exists)
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes i
    JOIN sys.objects o ON i.object_id = o.object_id
    WHERE o.name = 'AnimalMovimientos' AND i.name = 'IX_AnimalMovimientos_Tenant_Animal'
)
BEGIN
    CREATE INDEX IX_AnimalMovimientos_Tenant_Animal ON dbo.AnimalMovimientos (TenantId, AnimalId);
    PRINT 'Created index IX_AnimalMovimientos_Tenant_Animal.';
END
ELSE
    PRINT 'Index IX_AnimalMovimientos_Tenant_Animal already exists.';
GO

COMMIT;
PRINT 'Migration script completed.';
GO
