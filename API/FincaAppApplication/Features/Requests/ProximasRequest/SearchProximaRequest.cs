using FincaAppApplication.DTOs.Proxima;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Requests.ProximasRequest
{
    public class SearchProximaRequest : IRequest<List<ProximaDto>>
    {
        public string? Query { get; set; }
        public Guid? FincaId { get; set; }
    }
}
