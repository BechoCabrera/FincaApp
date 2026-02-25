using FincaAppDomain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FincaAppInfrastructure.Data.Configurations;

public class AnimalConfiguration : IEntityTypeConfiguration<Animal>
{
    public void Configure(EntityTypeBuilder<Animal> builder)
    {
        builder.ToTable("Animales");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.NumeroArete)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(a => a.Tipo)
            .IsRequired();

        builder.Property(a => a.Proposito)
            .IsRequired();

        builder.Property(a => a.FechaNacimiento)
            .HasColumnType("datetime2");

        builder.Property(a => a.EstadoActualHembra)
            .HasConversion<int?>();

        builder.Property(a => a.EstadoActualMacho)
            .HasConversion<int?>();

        builder.HasIndex(a => new { a.TenantId, a.NumeroArete })
            .IsUnique();

        // Relación Madre
        builder.HasOne<Animal>()
            .WithMany()
            .HasForeignKey(a => a.MadreId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relación Padre
        builder.HasOne<Animal>()
            .WithMany()
            .HasForeignKey(a => a.PadreId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}