using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.DTOs.Proxima
{

    public class ProximaDto
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
    }
}
