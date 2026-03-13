-- Script: add compatibility columns ToFincaId / FromFincaId to dbo.AnimalMovimientos
-- Purpose: some deployments expect ToFincaId (and/or FromFincaId) instead of FincaDestinoId/FincaOrigenId
-- This script adds the columns if missing, populates values from existing columns if present,
-- and creates a default constraint so inserts that don't provide them won't fail.
-- Review and backup DB before executing.

SET NOCOUNT ON;
GO

BEGIN TRANSACTION;
SET XACT_ABORT ON;

-- Add ToFincaId if missing
IF COL_LENGTH('dbo.AnimalMovimientos','ToFincaId') IS NULL
BEGIN
    ALTER TABLE dbo.AnimalMovimientos
    ADD ToFincaId UNIQUEIDENTIFIER NULL;
    PRINT 'Added column ToFincaId (NULL) to dbo.AnimalMovimientos.';
END
ELSE
    PRINT 'Column ToFincaId already exists.';
GO

-- Add FromFincaId if missing (alias for origen)
IF COL_LENGTH('dbo.AnimalMovimientos','FromFincaId') IS NULL
BEGIN
    ALTER TABLE dbo.AnimalMovimientos
    ADD FromFincaId UNIQUEIDENTIFIER NULL;
    PRINT 'Added column FromFincaId (NULL) to dbo.AnimalMovimientos.';
END
ELSE
    PRINT 'Column FromFincaId already exists.';
GO

-- Populate ToFincaId from FincaDestinoId if exists, otherwise leave as Guid.Empty
IF COL_LENGTH('dbo.AnimalMovimientos','FincaDestinoId') IS NOT NULL
BEGIN
    UPDATE dbo.AnimalMovimientos
    SET ToFincaId = COALESCE(ToFincaId, FincaDestinoId, '00000000-0000-0000-0000-000000000000')
    WHERE ToFincaId IS NULL;
    PRINT 'Populated ToFincaId from FincaDestinoId where NULL.';
END
ELSE
BEGIN
    UPDATE dbo.AnimalMovimientos
    SET ToFincaId = COALESCE(ToFincaId, '00000000-0000-0000-0000-000000000000')
    WHERE ToFincaId IS NULL;
    PRINT 'Populated ToFincaId with Guid.Empty where NULL (no FincaDestinoId present).';
END
GO

-- Populate FromFincaId from FincaOrigenId if exists
IF COL_LENGTH('dbo.AnimalMovimientos','FincaOrigenId') IS NOT NULL
BEGIN
    UPDATE dbo.AnimalMovimientos
    SET FromFincaId = COALESCE(FromFincaId, FincaOrigenId, '00000000-0000-0000-0000-000000000000')
    WHERE FromFincaId IS NULL;
    PRINT 'Populated FromFincaId from FincaOrigenId where NULL.';
END
ELSE
BEGIN
    UPDATE dbo.AnimalMovimientos
    SET FromFincaId = COALESCE(FromFincaId, '00000000-0000-0000-0000-000000000000')
    WHERE FromFincaId IS NULL;
    PRINT 'Populated FromFincaId with Guid.Empty where NULL (no FincaOrigenId present).';
END
GO

-- Add default constraints so inserts without specifying these columns won't fail
-- Create constraint for ToFincaId
IF NOT EXISTS (SELECT 1 FROM sys.default_constraints dc JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id WHERE OBJECT_NAME(dc.parent_object_id) = 'AnimalMovimientos' AND c.name = 'ToFincaId')
BEGIN
    ALTER TABLE dbo.AnimalMovimientos
    ADD CONSTRAINT DF_AnimalMovimientos_ToFincaId DEFAULT '00000000-0000-0000-0000-000000000000' FOR ToFincaId;
    PRINT 'Added default constraint DF_AnimalMovimientos_ToFincaId.';
END
ELSE
    PRINT 'Default constraint for ToFincaId already exists.';
GO

-- Create default constraint for FromFincaId
IF NOT EXISTS (SELECT 1 FROM sys.default_constraints dc JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id WHERE OBJECT_NAME(dc.parent_object_id) = 'AnimalMovimientos' AND c.name = 'FromFincaId')
BEGIN
    ALTER TABLE dbo.AnimalMovimientos
    ADD CONSTRAINT DF_AnimalMovimientos_FromFincaId DEFAULT '00000000-0000-0000-0000-000000000000' FOR FromFincaId;
    PRINT 'Added default constraint DF_AnimalMovimientos_FromFincaId.';
END
ELSE
    PRINT 'Default constraint for FromFincaId already exists.';
GO

COMMIT;
PRINT 'Compatibility alias script completed.';
GO
