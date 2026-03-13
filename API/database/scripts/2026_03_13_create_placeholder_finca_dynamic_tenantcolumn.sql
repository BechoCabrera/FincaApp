-- Dynamic placeholder finca insert: supports Tenants using TenantId or TenantKey and Fincas having TenantId or TenantKey
-- Safe for development. Review and backup DB before executing.

SET NOCOUNT ON;
GO

BEGIN TRANSACTION;
SET XACT_ABORT ON;

IF OBJECT_ID('dbo.Fincas') IS NULL
BEGIN
    PRINT 'Table dbo.Fincas does not exist. Aborting.';
    ROLLBACK;
    RETURN;
END

-- Determine tenant identifier value to use: prefer TenantId column value, otherwise TenantKey
DECLARE @tenantIdVal SQL_VARIANT = NULL;
DECLARE @tenantKeyVal NVARCHAR(200) = NULL;

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Tenants' AND COLUMN_NAME = 'TenantId')
BEGIN
    SELECT TOP 1 @tenantIdVal = TenantId FROM dbo.Tenants;
END

IF @tenantIdVal IS NULL AND EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Tenants' AND COLUMN_NAME = 'TenantKey')
BEGIN
    SELECT TOP 1 @tenantKeyVal = TenantKey FROM dbo.Tenants;
END

IF @tenantIdVal IS NULL AND @tenantKeyVal IS NULL
BEGIN
    -- no tenant rows or unexpected schema; leave tenant value null
    PRINT 'No tenant id/key found; placeholder finca will be inserted without tenant column if table supports it.';
END
ELSE
BEGIN
    PRINT 'Using tenant value for placeholder finca.';
END

-- Build dynamic insert for dbo.Fincas depending on available columns
DECLARE @cols NVARCHAR(MAX) = 'Id, Nombre, Codigo, Descripcion, IsActive, CreatedAt';
DECLARE @vals NVARCHAR(MAX) = '''00000000-0000-0000-0000-000000000000'', ''Finca placeholder (GUID empty)'', ''PL-HOLDER'', ''Placeholder finca to satisfy FK for AnimalMovimientos'', 1, SYSUTCDATETIME()';

-- If Fincas has TenantId column and we have a tenant id value, include it
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Fincas' AND COLUMN_NAME = 'TenantId') AND @tenantIdVal IS NOT NULL
BEGIN
    SET @cols = @cols + ', TenantId';
    SET @vals = @vals + ', ' + QUOTENAME(CAST(@tenantIdVal AS NVARCHAR(200)), '''');
END
ELSE IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Fincas' AND COLUMN_NAME = 'TenantKey') AND @tenantKeyVal IS NOT NULL
BEGIN
    SET @cols = @cols + ', TenantKey';
    SET @vals = @vals + ', ' + QUOTENAME(@tenantKeyVal, '''');
END

-- If Fincas has IsActive column but different name, quiet.

-- Only insert if placeholder finca id does not exist
IF NOT EXISTS (SELECT 1 FROM dbo.Fincas WHERE Id = '00000000-0000-0000-0000-000000000000')
BEGIN
    DECLARE @sql NVARCHAR(MAX) = N'INSERT INTO dbo.Fincas (' + @cols + ') VALUES (' + @vals + ');';
    PRINT 'Executing: ' + @sql;
    EXEC sp_executesql @sql;
    PRINT 'Inserted placeholder finca with Id = Guid.Empty';
END
ELSE
BEGIN
    PRINT 'Placeholder finca already exists.';
END

COMMIT;
GO
