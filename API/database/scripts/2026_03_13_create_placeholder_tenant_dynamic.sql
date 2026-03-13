-- Safe dynamic insert into dbo.Tenants: only include columns that actually exist in the table
-- Use in development. Review and backup DB before executing.

SET NOCOUNT ON;
GO

BEGIN TRANSACTION;
SET XACT_ABORT ON;

IF OBJECT_ID('dbo.Tenants') IS NULL
BEGIN
    PRINT 'Table dbo.Tenants does not exist. Aborting.';
    ROLLBACK;
    RETURN;
END

-- only insert if table empty
IF NOT EXISTS (SELECT 1 FROM dbo.Tenants)
BEGIN
    DECLARE @cols NVARCHAR(MAX) = 'Id';
    DECLARE @vals NVARCHAR(MAX) = '''00000000-0000-0000-0000-000000000000''';

    -- helper to append column/value if column exists
    DECLARE @appendColVal AS TABLE (ColName SYSNAME, Val NVARCHAR(MAX));
    INSERT INTO @appendColVal (ColName, Val)
    VALUES
      ('Nombre', '''Tenant placeholder'''),
      ('Documento', '''DUMMY'''),
      ('TenantId', '''default'''),
      ('CreatedAt', 'SYSUTCDATETIME()');

    DECLARE @c SYSNAME, @v NVARCHAR(MAX);
    DECLARE cur CURSOR FOR SELECT ColName, Val FROM @appendColVal;
    OPEN cur;
    FETCH NEXT FROM cur INTO @c, @v;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Tenants' AND COLUMN_NAME = @c)
        BEGIN
            SET @cols = @cols + ', ' + QUOTENAME(@c);
            -- if value is a function call (SYSUTCDATETIME()) we append without extra quotes
            IF @v LIKE '%SYSUTCDATETIME()%'
                SET @vals = @vals + ', ' + @v;
            ELSE
                SET @vals = @vals + ', ' + @v;
        END

        FETCH NEXT FROM cur INTO @c, @v;
    END
    CLOSE cur;
    DEALLOCATE cur;

    DECLARE @sql NVARCHAR(MAX) = N'INSERT INTO dbo.Tenants (' + @cols + ') VALUES (' + @vals + ');';
    PRINT 'Executing: ' + @sql;
    EXEC sp_executesql @sql;
    PRINT 'Inserted placeholder tenant (dynamic columns).';
END
ELSE
BEGIN
    PRINT 'dbo.Tenants already has rows; skipping placeholder tenant insert.';
END

COMMIT;
GO
