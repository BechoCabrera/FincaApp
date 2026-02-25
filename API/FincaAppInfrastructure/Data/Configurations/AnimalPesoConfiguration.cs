using FincaAppDomain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FincaAppInfrastructure.Data.Configurations;

public class AnimalPesoConfiguration : IEntityTypeConfiguration<AnimalPeso>
{
    public void Configure(EntityTypeBuilder<AnimalPeso> builder)
    {
        builder.ToTable("AnimalPesos");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Peso)
            .HasPrecision(18, 2);

        builder.HasIndex(x => new { x.TenantId, x.AnimalId });
    }
}