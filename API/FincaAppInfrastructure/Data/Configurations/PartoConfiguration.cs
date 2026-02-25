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
    }
}