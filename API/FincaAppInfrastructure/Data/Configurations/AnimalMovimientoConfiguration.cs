using FincaAppDomain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FincaAppInfrastructure.Data.Configurations;

public class AnimalMovimientoConfiguration : IEntityTypeConfiguration<AnimalMovimiento>
{
    public void Configure(EntityTypeBuilder<AnimalMovimiento> builder)
    {
        builder.ToTable("AnimalMovimientos");

        builder.HasKey(x => x.Id);

        builder.HasIndex(x => new { x.TenantId, x.AnimalId });
    }
}