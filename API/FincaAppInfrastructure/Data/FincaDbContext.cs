using System.Linq.Expressions;
using FincaAppApi.Tenancy;             // si prefieres no depender de API, mueve la interfaz a Domain.Common
using FincaAppDomain.Common;
using FincaAppDomain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FincaAppInfrastructure.Data;

public class FincaDbContext : DbContext
{
    private readonly ITenantProvider _tenant;

    public FincaDbContext(DbContextOptions<FincaDbContext> options, ITenantProvider tenant)
        : base(options) => _tenant = tenant;

    public DbSet<Toro> Toros => Set<Toro>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Índice único por tenant + negocio
        modelBuilder.Entity<Toro>(b =>
        {
            b.HasIndex(x => new { x.TenantId, x.Numero }).IsUnique();
            b.Property(x => x.Peso).HasPrecision(18, 2);
        });

        // Filtro global por TenantId
        foreach (var et in modelBuilder.Model.GetEntityTypes()
                     .Where(t => typeof(ITenantEntity).IsAssignableFrom(t.ClrType)))
        {
            var param = Expression.Parameter(et.ClrType, "e");
            var body = Expression.Equal(
                Expression.Property(param, nameof(ITenantEntity.TenantId)),
                Expression.Constant(_tenant.TenantId)
            );
            var lambda = Expression.Lambda(body, param);
            modelBuilder.Entity(et.ClrType).HasQueryFilter(lambda);
        }
    }

    public override int SaveChanges()
    {
        SetTenantOnAdded();
        return base.SaveChanges();
    }
    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        SetTenantOnAdded();
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
}
