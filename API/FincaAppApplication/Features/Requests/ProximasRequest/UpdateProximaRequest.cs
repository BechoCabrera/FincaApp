using FincaAppApplication.DTOs.Proxima;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Requests.ProximasRequest
{
    public class UpdateProximaRequest : IRequest<ProximaDto>
    {
        public Guid Id { get; set; }
        public DateTime? FechaDestete { get; set; }
        public DateTime? FPalpacion { get; set; }
        public int? DPrenez { get; set; }
        public string? Detalles { get; set; }
    }
}
