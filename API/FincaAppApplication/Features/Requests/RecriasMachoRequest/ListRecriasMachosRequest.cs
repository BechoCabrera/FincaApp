using FincaAppApplication.DTOs.RecriasMacho;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Requests.RecriasMachoRequest
{
    public class ListRecriasMachosRequest : IRequest<IReadOnlyList<RecriaMachoDto>>
    {
        public string? Nombre { get; set; }
    }
}
