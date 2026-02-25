using FincaAppDomain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FincaAppInfrastructure.Data.Configurations;

public class ProduccionLecheConfiguration : IEntityTypeConfiguration<ProduccionLeche>
{
    public void Configure(EntityTypeBuilder<ProduccionLeche> builder)
    {
        builder.ToTable("ProduccionesLeche");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Litros)
            .HasPrecision(18, 2);

        builder.HasIndex(x => new { x.TenantId, x.AnimalId });
    }
}