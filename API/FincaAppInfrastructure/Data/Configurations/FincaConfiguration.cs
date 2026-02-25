using FincaAppDomain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FincaAppInfrastructure.Data.Configurations;

public class FincaConfiguration : IEntityTypeConfiguration<Finca>
{
    public void Configure(EntityTypeBuilder<Finca> builder)
    {
        builder.ToTable("Fincas");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Codigo)
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(x => new { x.TenantId, x.Codigo })
            .IsUnique();
    }
}