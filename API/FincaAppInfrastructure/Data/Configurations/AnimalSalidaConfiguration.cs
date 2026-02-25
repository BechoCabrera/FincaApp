using FincaAppDomain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FincaAppInfrastructure.Data.Configurations;

public class AnimalSalidaConfiguration : IEntityTypeConfiguration<AnimalSalida>
{
    public void Configure(EntityTypeBuilder<AnimalSalida> builder)
    {
        builder.ToTable("AnimalSalidas");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Precio)
            .HasPrecision(18, 2);

        builder.HasIndex(x => new { x.TenantId, x.AnimalId });
    }
}