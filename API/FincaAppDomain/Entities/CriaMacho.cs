using FincaAppDomain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppDomain.Entities
{
    public class CriaMacho : BaseEntity
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = null!;
        public DateTime? FechaNac { get; set; }
        public string? Color { get; set; }
        public string? Propietario { get; set; }
        public decimal? PesoKg { get; set; }
        public Guid? FincaId { get; set; }
        public Guid? MadreId { get; set; }
        public string? MadreNombre { get; set; }
        public string? Detalles { get; set; }
    }
}
