
using FincaAppDomain.Common;
using FincaAppDomain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using MediatR;
namespace FincaAppInfrastructure.Data;

public class FincaDbContext : DbContext
{
    private readonly ITenantProvider _tenant;
    public string CurrentTenantId => _tenant.TenantId;
    private readonly IMediator _mediator;

    public FincaDbContext(
        DbContextOptions<FincaDbContext> options,
        ITenantProvider tenant,
        IMediator mediator)
        : base(options)
    {
        _mediator = mediator;
        _tenant = tenant;
    }

    // ==========================
    // NUEVOS DbSets
    // ==========================

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Finca> Fincas => Set<Finca>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();

    public DbSet<Animal> Animales => Set<Animal>();
    public DbSet<AnimalEstadoHistorial> AnimalEstados => Set<AnimalEstadoHistorial>();
    public DbSet<AnimalMovimiento> AnimalMovimientos => Set<AnimalMovimiento>();
    public DbSet<Parto> Partos => Set<Parto>();
    public DbSet<AnimalPeso> AnimalPesos => Set<AnimalPeso>();
    public DbSet<AnimalDestete> AnimalDestetes => Set<AnimalDestete>();
    public DbSet<ProduccionLeche> ProduccionesLeche => Set<ProduccionLeche>();
    public DbSet<AnimalSalida> AnimalSalidas => Set<AnimalSalida>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(FincaDbContext).Assembly);

        // ==========================
        // Filtro global por Tenant
        // ==========================

        foreach (var entityType in modelBuilder.Model.GetEntityTypes()
            .Where(t => typeof(ITenantEntity).IsAssignableFrom(t.ClrType)))
        {
            var parameter = Expression.Parameter(entityType.ClrType, "e");
            var tenantProperty = Expression.Property(parameter, nameof(ITenantEntity.TenantId));
            var currentTenant = Expression.Property(
                Expression.Constant(this),
                nameof(CurrentTenantId));

            var body = Expression.Equal(tenantProperty, currentTenant);
            var lambda = Expression.Lambda(body, parameter);

            modelBuilder.Entity(entityType.ClrType)
                .HasQueryFilter(lambda);
        }

        // ==========================
        // Índices importantes
        // ==========================

        modelBuilder.Entity<Animal>()
            .HasIndex(a => new { a.TenantId, a.NumeroArete })
            .IsUnique();
    }

    public override int SaveChanges()
    {
        SetTenantOnAdded();
        SetAuditFields();
        return base.SaveChanges();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        SetTenantOnAdded();
        SetAuditFields();

        var domainEntities = ChangeTracker
            .Entries<BaseEntity>()
            .Where(x => x.Entity.DomainEvents.Any())
            .ToList();

        var domainEvents = domainEntities
            .SelectMany(x => x.Entity.DomainEvents)
            .ToList();

        foreach (var entity in domainEntities)
            entity.Entity.ClearDomainEvents();

        var result = await base.SaveChangesAsync(ct);

        foreach (var domainEvent in domainEvents)
            await _mediator.Publish((dynamic)domainEvent, ct);

        return result;
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

            if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
    }
}