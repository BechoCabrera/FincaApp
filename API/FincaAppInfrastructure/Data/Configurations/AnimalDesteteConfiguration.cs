using FincaAppDomain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FincaAppInfrastructure.Data.Configurations;

public class AnimalDesteteConfiguration : IEntityTypeConfiguration<AnimalDestete>
{
    public void Configure(EntityTypeBuilder<AnimalDestete> builder)
    {
        builder.ToTable("AnimalDestetes");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.PesoKg)
            .HasPrecision(18, 2);

        // Optional: index to speed queries by tenant + animal
        builder.HasIndex(x => new { x.TenantId, x.AnimalId });
    }
}
