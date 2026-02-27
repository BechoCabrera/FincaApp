-- 002_drop_unused_tables.sql
-- Script para eliminar tablas que parecen redundantes con el modelo actual de FincaApp
-- RECOMENDACIÓN: HAZ BACKUP antes de ejecutar. Revisa el script y los nombres de tablas en tu BD.
-- Este script intentará eliminar FKs que referencien las tablas a borrar y luego borrar las tablas.
-- NO borra tablas que la aplicación usa (Animales, AnimalEstadoHistorial, AnimalMovimientos, Fincas, Usuarios, Tenants).

SET NOCOUNT ON;

BEGIN TRANSACTION;

DECLARE @tablesToDrop TABLE (name SYSNAME);

INSERT INTO @tablesToDrop (name) VALUES
('CriasHembras'),
('CriasMachos'),
('Escoteras'),
('Estados'),
('Fallecidas'),
('NovillasVientre'),
('Paridas'),
('Proximas'),
('RecriasHembras'),
('RecriasMachos'),
('Toros'),
('Users'),
('UserTenants'),
('Ventas');

DECLARE @t SYSNAME;
DECLARE @sql NVARCHAR(MAX);

DECLARE cur CURSOR FOR SELECT name FROM @tablesToDrop;
OPEN cur;
FETCH NEXT FROM cur INTO @t;
WHILE @@FETCH_STATUS = 0
BEGIN
    IF OBJECT_ID(QUOTENAME('dbo') + '.' + QUOTENAME(@t), 'U') IS NOT NULL
    BEGIN
        -- Eliminar FKs que referencien a esta tabla
        SELECT @sql = STRING_AGG('ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(fk.[parent_object_id])) + '.' + QUOTENAME(OBJECT_NAME(fk.[parent_object_id])) + ' DROP CONSTRAINT ' + QUOTENAME(fk.name), '; ')
        FROM sys.foreign_keys fk
        WHERE fk.referenced_object_id = OBJECT_ID(QUOTENAME('dbo') + '.' + QUOTENAME(@t));

        IF @sql IS NOT NULL
        BEGIN
            PRINT 'Dropping FKs referencing dbo.' + @t + ' -> ' + @sql;
            EXEC sp_executesql @sql;
        END

        -- Ahora borrar la tabla
        SET @sql = N'DROP TABLE dbo.' + QUOTENAME(@t);
        PRINT 'Dropping table dbo.' + @t;
        EXEC sp_executesql @sql;
    END
    ELSE
    BEGIN
        PRINT 'Table dbo.' + @t + ' does not exist. Skipping.';
    END

    FETCH NEXT FROM cur INTO @t;
END

CLOSE cur;
DEALLOCATE cur;

COMMIT TRANSACTION;

PRINT 'Drop script finished.';
