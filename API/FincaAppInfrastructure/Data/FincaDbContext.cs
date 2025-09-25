using Microsoft.EntityFrameworkCore;
using FincaAppApi.Domain.Entities;

namespace FincaAppApi.Data
{
    public class FincaDbContext : DbContext
    {
        public FincaDbContext(DbContextOptions<FincaDbContext> options)
            : base(options) { }

        public DbSet<Toro> Toros { get; set; } // Modelo de ejemplo

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración para la propiedad Peso de Toro
            modelBuilder.Entity<Toro>()
                .Property(t => t.Peso)
                .HasPrecision(18,2);  // Establecer la precisión (18) y la escala (2)    .HasColumnType("decimal(18,2)");
        }
    }
}
