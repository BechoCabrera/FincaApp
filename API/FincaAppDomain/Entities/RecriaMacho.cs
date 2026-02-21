using FincaAppDomain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppDomain.Entities
{
    public class RecriaMacho : BaseEntity
    {
        public string Nombre { get; set; } = default!;
        public DateTime? FechaNac { get; set; }
        public decimal? PesoKg { get; set; }
        public string? Color { get; set; }
        public string? Propietario { get; set; }
        public Guid FincaId { get; set; }
        public Guid? MadreId { get; set; }
        public string? Detalles { get; set; }
        public DateTime? FechaDestete { get; set; }

        // Relaciones de navegación
        public Finca Finca { get; set; } = default!;
        public Paridas Madre { get; set; } = default!;
    }
}
