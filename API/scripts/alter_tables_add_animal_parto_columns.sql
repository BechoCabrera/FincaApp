-- Script: add new columns required by the updated domain model
-- Run this on your SQL Server database for the FincaApp application
-- Make a backup before running on production.

-- Add new columns to Animales table if they do not exist
IF COL_LENGTH('dbo.Animales', 'Color') IS NULL
BEGIN
    ALTER TABLE dbo.Animales ADD Color NVARCHAR(100) NULL;
END

IF COL_LENGTH('dbo.Animales', 'TipoLeche') IS NULL
BEGIN
    ALTER TABLE dbo.Animales ADD TipoLeche NVARCHAR(100) NULL;
END

IF COL_LENGTH('dbo.Animales', 'Propietario') IS NULL
BEGIN
    ALTER TABLE dbo.Animales ADD Propietario NVARCHAR(200) NULL;
END

IF COL_LENGTH('dbo.Animales', 'PesoKg') IS NULL
BEGIN
    ALTER TABLE dbo.Animales ADD PesoKg DECIMAL(10,2) NULL;
END

IF COL_LENGTH('dbo.Animales', 'Detalles') IS NULL
BEGIN
    ALTER TABLE dbo.Animales ADD Detalles NVARCHAR(MAX) NULL;
END

-- Ensure Partos table has the extended fields (safe-add if missing)
IF OBJECT_ID('dbo.Partos', 'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('dbo.Partos', 'FechaPalpacion') IS NULL
    BEGIN
        ALTER TABLE dbo.Partos ADD FechaPalpacion DATETIME2 NULL;
    END

    IF COL_LENGTH('dbo.Partos', 'FechaNacimiento') IS NULL
    BEGIN
        ALTER TABLE dbo.Partos ADD FechaNacimiento DATETIME2 NULL;
    END

    IF COL_LENGTH('dbo.Partos', 'GeneroCria') IS NULL
    BEGIN
        ALTER TABLE dbo.Partos ADD GeneroCria NVARCHAR(20) NULL;
    END

    IF COL_LENGTH('dbo.Partos', 'Color') IS NULL
    BEGIN
        ALTER TABLE dbo.Partos ADD Color NVARCHAR(100) NULL;
    END

    IF COL_LENGTH('dbo.Partos', 'TipoLeche') IS NULL
    BEGIN
        ALTER TABLE dbo.Partos ADD TipoLeche NVARCHAR(100) NULL;
    END

    IF COL_LENGTH('dbo.Partos', 'Procedencia') IS NULL
    BEGIN
        ALTER TABLE dbo.Partos ADD Procedencia NVARCHAR(200) NULL;
    END

    IF COL_LENGTH('dbo.Partos', 'Propietario') IS NULL
    BEGIN
        ALTER TABLE dbo.Partos ADD Propietario NVARCHAR(200) NULL;
    END

    IF COL_LENGTH('dbo.Partos', 'Observaciones') IS NULL
    BEGIN
        ALTER TABLE dbo.Partos ADD Observaciones NVARCHAR(MAX) NULL;
    END
END
ELSE
BEGIN
    PRINT 'Table dbo.Partos not found - skipping Partos column additions.';
END

-- Optional: create index on Animales.NumeroArete if not exists (helps lookups by numero)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.Animales') AND name = 'IX_Animales_NumeroArete')
BEGIN
    CREATE NONCLUSTERED INDEX IX_Animales_NumeroArete ON dbo.Animales(NumeroArete);
END

PRINT 'ALTER script finished.';
