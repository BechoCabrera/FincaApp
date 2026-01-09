using System.Linq.Expressions;
// si prefieres no depender de API, mueve la interfaz a Domain.Common
using FincaAppDomain.Common;
using FincaAppDomain.Entities;
using Microsoft.EntityFrameworkCore;
namespace FincaAppInfrastructure.Data;

public class FincaDbContext : DbContext
{
    private readonly ITenantProvider _tenant;
    public string CurrentTenantId => _tenant.TenantId;

    public FincaDbContext(DbContextOptions<FincaDbContext> options, ITenantProvider tenant)
        : base(options) => _tenant = tenant;
    public DbSet<Parida> Paridas => Set<Parida>();
    public DbSet<Toro> Toros => Set<Toro>();
    public DbSet<Finca> Fincas => Set<Finca>();
    public DbSet<User> Users { get; set; }
    public DbSet<UserTenant> UserTenants { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Índice único por tenant + negocio
        modelBuilder.Entity<Toro>(b =>
        {
            b.ToTable("Toros");

            b.HasKey(x => x.Id);

            b.Property(x => x.Id)
                .ValueGeneratedNever();

            b.Property(x => x.Numero)
                .HasMaxLength(50)
                .IsRequired();

            b.Property(x => x.Nombre)
                .HasMaxLength(50)
                .IsRequired();

            b.Property(x => x.FincaId)                
                .IsRequired();

            b.Property(x => x.PesoKg)
                .HasPrecision(18, 2)
                .IsRequired();

            b.Property(x => x.FechaNacimiento)
                .HasColumnType("datetime2(7)");             

            b.Property(x => x.CreatedAt)
                .HasColumnType("datetime2(7)")
                .IsRequired();

            b.Property(x => x.UpdatedAt)
                .HasColumnType("datetime2(7)");

            b.HasIndex(x => new { x.TenantId, x.Numero })
                .IsUnique();
        });

        modelBuilder.Entity<Finca>(b =>
        {
            b.ToTable("Fincas");

            b.HasKey(x => x.Id);

            b.Property(x => x.Id)
                .ValueGeneratedNever();

            b.Property(x => x.Codigo)
                .HasMaxLength(10)
                .IsRequired();

            b.Property(x => x.Nombre)
                .HasMaxLength(50)
                .IsRequired();

            b.Property(x => x.Descripcion)
                .HasMaxLength(200);

            b.Property(x => x.IsActive)
                .IsRequired();

            b.Property(x => x.CreatedAt)
                .HasColumnType("datetime2(7)")
                .IsRequired();

            b.Property(x => x.UpdatedAt)
                .HasColumnType("datetime2(7)");

            b.HasIndex(x => new { x.TenantId, x.Codigo })
                .IsUnique();
        });

        modelBuilder.Entity<UserTenant>(b =>
        {
            b.ToTable("UserTenants");

            // 🔑 Clave primaria compuesta
            b.HasKey(x => new { x.UserId, x.TenantId });

            b.HasOne(x => x.User)
                .WithMany(u => u.UserTenants)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });


        // Filtro global por TenantId
        foreach (var et in modelBuilder.Model.GetEntityTypes()
         .Where(t => typeof(ITenantEntity).IsAssignableFrom(t.ClrType)))
        {
            var param = Expression.Parameter(et.ClrType, "e");

            var tenantProp = Expression.Property(param, nameof(ITenantEntity.TenantId));
            var currentTenant = Expression.Property(Expression.Constant(this), nameof(CurrentTenantId));

            var body = Expression.OrElse(
                Expression.Equal(currentTenant, Expression.Constant(string.Empty)),
                Expression.Equal(tenantProp, currentTenant)
            );

            var lambda = Expression.Lambda(body, param);
            modelBuilder.Entity(et.ClrType).HasQueryFilter(lambda);
        }

    }

    public override int SaveChanges()
    {
        SetTenantOnAdded();
        SetAuditFields();
        return base.SaveChanges();
    }
    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        SetTenantOnAdded();
        SetAuditFields();
        return base.SaveChangesAsync(ct);
    }
    private void SetTenantOnAdded()
    {
        foreach (var entry in ChangeTracker.Entries()
                     .Where(e => e.State == EntityState.Added && e.Entity is ITenantEntity)
                     .Select(e => (ITenantEntity)e.Entity))
        {
            entry.TenantId = _tenant.TenantId;
        }
    }

    private void SetAuditFields()
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added && entry.Entity.CreatedAt == default)
                entry.Entity.CreatedAt = DateTime.UtcNow;
        }
    }
}
