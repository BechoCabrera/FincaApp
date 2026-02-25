using FincaAppDomain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FincaAppInfrastructure.Data.Configurations;

public class AnimalEstadoHistorialConfiguration : IEntityTypeConfiguration<AnimalEstadoHistorial>
{
    public void Configure(EntityTypeBuilder<AnimalEstadoHistorial> builder)
    {
        builder.ToTable("AnimalEstadoHistorial");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.EstadoAnterior)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.EstadoNuevo)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(x => new { x.TenantId, x.AnimalId });
    }
}