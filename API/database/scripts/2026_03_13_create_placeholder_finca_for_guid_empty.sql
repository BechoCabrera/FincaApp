-- Script: create placeholder Finca with Id = Guid.Empty to satisfy FK from AnimalMovimientos
-- Use only in development environments. Review and backup your DB before running.

SET NOCOUNT ON;
GO

BEGIN TRANSACTION;
SET XACT_ABORT ON;

-- Ensure there's at least one tenant; if none, create a placeholder tenant
IF NOT EXISTS (SELECT 1 FROM dbo.Tenants)
BEGIN
    INSERT INTO dbo.Tenants (Id, Nombre, Documento, TenantId, CreatedAt)
    VALUES ('00000000-0000-0000-0000-000000000000', 'Tenant placeholder', 'DUMMY', 'default', SYSUTCDATETIME());
    PRINT 'Created placeholder tenant.';
END

-- Determine a tenant id to assign to the placeholder finca
DECLARE @tenantId nvarchar(100) = (SELECT TOP 1 TenantId FROM dbo.Tenants);
IF @tenantId IS NULL SET @tenantId = 'default';

-- Insert placeholder finca with Id = Guid.Empty if not exists
IF NOT EXISTS (SELECT 1 FROM dbo.Fincas WHERE Id = '00000000-0000-0000-0000-000000000000')
BEGIN
    INSERT INTO dbo.Fincas (Id, Nombre, Codigo, Descripcion, IsActive, TenantId, CreatedAt)
    VALUES ('00000000-0000-0000-0000-000000000000', 'Finca placeholder (GUID empty)', 'PL-HOLDER', 'Placeholder finca to satisfy FK for AnimalMovimientos', 1, @tenantId, SYSUTCDATETIME());
    PRINT 'Inserted placeholder finca with Id = Guid.Empty';
END
ELSE
    PRINT 'Placeholder finca already exists.';

COMMIT;
GO
