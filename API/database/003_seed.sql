-- 003_seed.sql
-- Datos de prueba mínimos para FincaApp
-- Inserta un tenant, una finca, un usuario y dos animales (hembra y macho)
-- Ejecutar después de 001_create_schema.sql

SET NOCOUNT ON;

BEGIN TRANSACTION;

-- Tenant
IF NOT EXISTS (SELECT 1 FROM dbo.Tenants WHERE TenantKey = 'tenant-test')
BEGIN
    INSERT INTO dbo.Tenants (TenantKey, Nombre, Documento)
    VALUES ('tenant-test', 'Tenant Test', 'DOC-TEST');
END;

DECLARE @tenantKey NVARCHAR(100) = 'tenant-test';

-- Finca
DECLARE @fincaId UNIQUEIDENTIFIER;
IF NOT EXISTS (SELECT 1 FROM dbo.Fincas WHERE TenantId = @tenantKey AND Nombre = 'Finca Prueba')
BEGIN
    SET @fincaId = NEWID();
    INSERT INTO dbo.Fincas (Id, TenantId, Nombre, Direccion)
    VALUES (@fincaId, @tenantKey, 'Finca Prueba', 'Dirección de prueba');
END
ELSE
BEGIN
    SELECT TOP 1 @fincaId = Id FROM dbo.Fincas WHERE TenantId = @tenantKey AND Nombre = 'Finca Prueba';
END;

-- Usuario
DECLARE @usuarioId UNIQUEIDENTIFIER;
IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE TenantId = @tenantKey AND Email = 'test@example.com')
BEGIN
    SET @usuarioId = NEWID();
    INSERT INTO dbo.Usuarios (Id, TenantId, Nombre, Email, PasswordHash)
    VALUES (@usuarioId, @tenantKey, 'Usuario Prueba', 'test@example.com', 'password-hash-placeholder');
END
ELSE
BEGIN
    SELECT TOP 1 @usuarioId = Id FROM dbo.Usuarios WHERE TenantId = @tenantKey AND Email = 'test@example.com';
END;

-- Animal hembra de prueba
DECLARE @animalHembraId UNIQUEIDENTIFIER;
IF NOT EXISTS (SELECT 1 FROM dbo.Animales WHERE TenantId = @tenantKey AND NumeroArete = 'H-001')
BEGIN
    SET @animalHembraId = NEWID();
    INSERT INTO dbo.Animales (Id, TenantId, NumeroArete, Tipo, Proposito, FechaNacimiento, FincaActualId, EstadoActualHembra, CreatedAt)
    VALUES (@animalHembraId, @tenantKey, 'H-001', 1, 1, DATEADD(year, -1, SYSUTCDATETIME()), @fincaId, 1, SYSUTCDATETIME());
END
ELSE
BEGIN
    SELECT TOP 1 @animalHembraId = Id FROM dbo.Animales WHERE TenantId = @tenantKey AND NumeroArete = 'H-001';
END;

-- Animal macho de prueba
DECLARE @animalMachoId UNIQUEIDENTIFIER;
IF NOT EXISTS (SELECT 1 FROM dbo.Animales WHERE TenantId = @tenantKey AND NumeroArete = 'M-001')
BEGIN
    SET @animalMachoId = NEWID();
    INSERT INTO dbo.Animales (Id, TenantId, NumeroArete, Tipo, Proposito, FechaNacimiento, FincaActualId, EstadoActualMacho, CreatedAt)
    VALUES (@animalMachoId, @tenantKey, 'M-001', 2, 1, DATEADD(year, -1, SYSUTCDATETIME()), @fincaId, 1, SYSUTCDATETIME());
END
ELSE
BEGIN
    SELECT TOP 1 @animalMachoId = Id FROM dbo.Animales WHERE TenantId = @tenantKey AND NumeroArete = 'M-001';
END;

COMMIT TRANSACTION;

PRINT 'Seed applied.';
