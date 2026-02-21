using FincaAppApplication.DTOs.Fallecida;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Requests.FallecidaRequest
{
    public class CreateFallecidaRequest : IRequest<FallecidaDto>
    {
        public string Categoria { get; set; } = string.Empty;
        public Guid AnimalId { get; set; }
        public DateTime FechaFallecimiento { get; set; }
        public string? Causa { get; set; }
        public string? Notas { get; set; }
        public string TenantId { get; set; } = string.Empty;
    }
}
