using FincaAppApplication.DTOs.RecriaHembra;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Requests.RecriasHembraRecuest
{
    public class GetRecriaHembraByIdRequest : IRequest<RecriaHembraDto>
    {
        public Guid Id { get; set; }
    }
}
