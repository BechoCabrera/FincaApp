using MediatR;
using FincaAppApplication.DTOs.Finca;
using System.Collections.Generic;

namespace FincaAppApplication.Features.Requests.FincaRequest
{
    public class ListFincasRequest : IRequest<List<FincaDto>>
    {
    }
}
