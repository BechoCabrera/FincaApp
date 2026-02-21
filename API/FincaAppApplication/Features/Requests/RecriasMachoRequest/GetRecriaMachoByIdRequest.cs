using FincaAppApplication.DTOs.RecriasMacho;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Requests.RecriasMachoRequest
{
    public class GetRecriaMachoByIdRequest : IRequest<RecriaMachoDto>
    {
        public Guid Id { get; set; }
    }
}
