using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.DTOs.RecriasMacho
{
    public class RecriaMachoDto
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = default!;
        public DateTime? FechaNac { get; set; }
        public decimal? PesoKg { get; set; }
        public string? Color { get; set; }
        public string? Propietario { get; set; }
        public Guid FincaId { get; set; }
        public Guid? MadreId { get; set; }
        public string? MadreNumero { get; set; } // Solo en el DTO
        public string? MadreNombre { get; set; } // Solo en el DTO
        public string? Detalles { get; set; }
        public DateTime? FechaDestete { get; set; }
    }
}
