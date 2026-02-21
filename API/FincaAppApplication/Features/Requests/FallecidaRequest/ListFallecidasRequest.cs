using FincaAppApplication.DTOs.Fallecida;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Requests.FallecidaRequest
{
    public class ListFallecidasRequest : IRequest<List<FallecidaDto>>
    {
    }
}
