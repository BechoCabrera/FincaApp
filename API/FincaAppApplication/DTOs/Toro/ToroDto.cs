using FincaAppDomain.Entities;

namespace FincaAppApi.DTOs.Toro
{
    public class ToroDto
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = default!;
        public DateTime? FechaNac { get; set; }
        public decimal? PesoKg { get; set; }
        public string? Color { get; set; }
        public string? Propietario { get; set; }
        public Guid FincaId { get; set; } = default!;
        public string? Detalles { get; set; }
        public DateTime? FechaDestete { get; set; }
        public Guid? MadreId { get; set; } // AGREGAR SI NO ESTÁ
        public string? MadreNumero { get; set; }
        // NUEVAS PROPIEDADES
        public string? MadreNombre { get; set; }
        public string? NombreFinca { get; set; }
    }

}
