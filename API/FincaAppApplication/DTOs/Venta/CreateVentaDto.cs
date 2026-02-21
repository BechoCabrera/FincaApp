using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.DTOs.Venta
{
    public class CreateVentaDto
    {
        public string Categoria { get; set; } = null!;
        public Guid AnimalId { get; set; }
        public DateTime FechaVenta { get; set; }
        public string? Comprador { get; set; }
        public decimal? Precio { get; set; }
        public string? Notas { get; set; }
    }
}
