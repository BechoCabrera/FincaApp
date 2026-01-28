using System;

namespace FincaAppDomain.Entities
{
    public class Proxima
    {
        public Guid Id { get; set; }

        public int Numero { get; set; }
        public string Nombre { get; set; } = null!;

        public DateTime? FechaNacida { get; set; }
        public string? Color { get; set; }
        public string? NroMama { get; set; }
        public string? Procedencia { get; set; }
        public string? Propietario { get; set; }

        public DateTime? FechaDestete { get; set; }
        public DateTime? FPalpacion { get; set; }
        public int? DPrenez { get; set; }
        public string? Detalles { get; set; }

        public Guid? FincaId { get; set; }
        public Guid TenantId { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
