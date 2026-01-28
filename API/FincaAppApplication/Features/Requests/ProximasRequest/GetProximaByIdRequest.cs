using FincaAppApplication.DTOs.Proxima;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Requests.ProximasRequest
{
    public class GetProximaByIdRequest : IRequest<ProximaDto>
    {
        public Guid Id { get; set; }
    }
}
