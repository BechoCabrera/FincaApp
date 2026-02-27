-- 001_create_schema.sql
-- Script para crear el esquema mínimo requerido por FincaApp
-- Ejecutar en el contexto de la base de datos destino (SQL Server)


SET NOCOUNT ON;

BEGIN TRANSACTION;

-- Eliminar tablas si existen (orden descendente de dependencias)
IF OBJECT_ID(N'dbo.AnimalMovimientos', N'U') IS NOT NULL DROP TABLE dbo.AnimalMovimientos;
IF OBJECT_ID(N'dbo.AnimalEstadoHistorial', N'U') IS NOT NULL DROP TABLE dbo.AnimalEstadoHistorial;
IF OBJECT_ID(N'dbo.Animales', N'U') IS NOT NULL DROP TABLE dbo.Animales;
IF OBJECT_ID(N'dbo.Fincas', N'U') IS NOT NULL DROP TABLE dbo.Fincas;
IF OBJECT_ID(N'dbo.Usuarios', N'U') IS NOT NULL DROP TABLE dbo.Usuarios;
IF OBJECT_ID(N'dbo.Tenants', N'U') IS NOT NULL DROP TABLE dbo.Tenants;

-- Tenants
CREATE TABLE dbo.Tenants (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    TenantKey NVARCHAR(100) NOT NULL UNIQUE,
    Nombre NVARCHAR(200) NOT NULL,
    Documento NVARCHAR(100) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL
);

-- Usuarios
CREATE TABLE dbo.Usuarios (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    TenantId NVARCHAR(100) NOT NULL,
    Nombre NVARCHAR(200) NOT NULL,
    Email NVARCHAR(256) NOT NULL,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_Usuarios_Tenants_TenantKey FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantKey)
);

-- Fincas
CREATE TABLE dbo.Fincas (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    TenantId NVARCHAR(100) NOT NULL,
    Nombre NVARCHAR(200) NOT NULL,
    Direccion NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_Fincas_Tenants_TenantKey FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantKey)
);

-- Animales
CREATE TABLE dbo.Animales (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    TenantId NVARCHAR(100) NOT NULL,
    NumeroArete NVARCHAR(100) NOT NULL,
    Tipo INT NOT NULL,
    Proposito INT NOT NULL,
    FechaNacimiento DATETIME2 NOT NULL,
    MadreId UNIQUEIDENTIFIER NULL,
    PadreId UNIQUEIDENTIFIER NULL,
    FincaActualId UNIQUEIDENTIFIER NOT NULL,
    Activo BIT NOT NULL DEFAULT 1,
    EstadoActualHembra INT NULL,
    EstadoActualMacho INT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_Animales_Fincas_FincaActual FOREIGN KEY (FincaActualId) REFERENCES dbo.Fincas(Id),
    CONSTRAINT FK_Animales_Tenants_TenantKey FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantKey),
    CONSTRAINT FK_Animales_Madre FOREIGN KEY (MadreId) REFERENCES dbo.Animales(Id),
    CONSTRAINT FK_Animales_Padre FOREIGN KEY (PadreId) REFERENCES dbo.Animales(Id)
);

CREATE UNIQUE INDEX IX_Animales_Tenant_NumeroArete ON dbo.Animales(TenantId, NumeroArete);
CREATE INDEX IX_Animales_FincaActualId ON dbo.Animales(FincaActualId);

-- AnimalEstadoHistorial
CREATE TABLE dbo.AnimalEstadoHistorial (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    TenantId NVARCHAR(100) NOT NULL,
    AnimalId UNIQUEIDENTIFIER NOT NULL,
    EstadoAnterior NVARCHAR(100) NOT NULL,
    EstadoNuevo NVARCHAR(100) NOT NULL,
    FechaCambio DATETIME2 NOT NULL,
    UsuarioId UNIQUEIDENTIFIER NULL,
    Observacion NVARCHAR(1000) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_Historial_Animales FOREIGN KEY (AnimalId) REFERENCES dbo.Animales(Id),
    CONSTRAINT FK_Historial_Usuarios FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(Id),
    CONSTRAINT FK_Historial_Tenants_TenantKey FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantKey)
);

CREATE INDEX IX_Historial_AnimalId ON dbo.AnimalEstadoHistorial(AnimalId);
CREATE INDEX IX_Historial_TenantId ON dbo.AnimalEstadoHistorial(TenantId);

-- AnimalMovimientos
CREATE TABLE dbo.AnimalMovimientos (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    TenantId NVARCHAR(100) NOT NULL,
    AnimalId UNIQUEIDENTIFIER NOT NULL,
    FromFincaId UNIQUEIDENTIFIER NULL,
    ToFincaId UNIQUEIDENTIFIER NOT NULL,
    Fecha DATETIME2 NOT NULL,
    UsuarioId UNIQUEIDENTIFIER NULL,
    Observacion NVARCHAR(1000) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_Mov_Animales FOREIGN KEY (AnimalId) REFERENCES dbo.Animales(Id),
    CONSTRAINT FK_Mov_FincaFrom FOREIGN KEY (FromFincaId) REFERENCES dbo.Fincas(Id),
    CONSTRAINT FK_Mov_FincaTo FOREIGN KEY (ToFincaId) REFERENCES dbo.Fincas(Id),
    CONSTRAINT FK_Mov_Usuarios FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(Id),
    CONSTRAINT FK_Mov_Tenants_TenantKey FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantKey)
);

CREATE INDEX IX_Mov_AnimalId ON dbo.AnimalMovimientos(AnimalId);
CREATE INDEX IX_Mov_ToFincaId ON dbo.AnimalMovimientos(ToFincaId);
CREATE INDEX IX_Mov_FromFincaId ON dbo.AnimalMovimientos(FromFincaId);

COMMIT TRANSACTION;

PRINT 'Schema created/updated.';
