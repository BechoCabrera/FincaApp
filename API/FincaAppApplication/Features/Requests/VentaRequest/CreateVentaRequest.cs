using FincaAppApplication.DTOs.Venta;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Requests.VentaRequest
{
    public class CreateVentaRequest : IRequest<VentaDto>
    {
        public string Categoria { get; set; } = string.Empty;
        public Guid AnimalId { get; set; }
        public DateTime FechaVenta { get; set; }
        public string? Comprador { get; set; }
        public decimal? Precio { get; set; }
        public string? Notas { get; set; }
        public string TenantId { get; set; } = string.Empty;
    }
}
