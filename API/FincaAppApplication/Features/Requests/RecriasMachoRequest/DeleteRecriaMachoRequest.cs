using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Requests.RecriasMachoRequest
{
    public class DeleteRecriaMachoRequest : IRequest
    {
        public Guid Id { get; set; }
    }
}
