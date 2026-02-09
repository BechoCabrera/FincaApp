using FincaAppApplication.DTOs.CriaMacho;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Requests.CriaMachoRequest
{
    public class SearchCriasMachosRequest : IRequest<List<CriaMachoDto>>
    {
        public string? Nombre { get; set; }
        public Guid? FincaId { get; set; }
    }
}
