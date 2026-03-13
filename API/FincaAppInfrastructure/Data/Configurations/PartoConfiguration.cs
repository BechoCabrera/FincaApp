using FincaAppDomain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FincaAppInfrastructure.Data.Configurations;

public class PartoConfiguration : IEntityTypeConfiguration<Parto>
{
    public void Configure(EntityTypeBuilder<Parto> builder)
    {
        builder.ToTable("Partos");

        builder.HasKey(x => x.Id);

        builder.HasIndex(x => new { x.TenantId, x.AnimalMadreId });

        // Configure snapshot columns
        builder.Property(p => p.CriaNumero).HasMaxLength(100);
        builder.Property(p => p.CriaNombre).HasMaxLength(200);
        builder.Property(p => p.CriaColor).HasMaxLength(100);
        builder.Property(p => p.CriaPropietario).HasMaxLength(200);
        builder.Property(p => p.CriaPesoKg).HasColumnType("decimal(10,2)");
        builder.Property(p => p.CriaDetalles).HasMaxLength(2000);
    }
}