using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.DTOs.NovillaVientre
{
    public class NovillaVientreDto
    {
        public Guid Id { get; set; }
        public string Numero { get; set; }
        public string Nombre { get; set; }
        public DateTime? FechaNac { get; set; }
        public DateTime? FechaDestete { get; set; }
        public string? Color { get; set; }
        public string? Propietario { get; set; }
        public decimal? PesoKg { get; set; }
        public Guid? FincaId { get; set; }
        public string? MadreNumero { get; set; }
        public string? MadreNombre { get; set; }
        public string? Procedencia { get; set; }
        public string? Detalles { get; set; }
    }
}
