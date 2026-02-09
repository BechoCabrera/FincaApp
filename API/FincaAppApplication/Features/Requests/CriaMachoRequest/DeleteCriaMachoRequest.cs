using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Requests.CriaMachoRequest
{
    public class DeleteCriaMachoRequest : IRequest<Guid>
    {
        public Guid Id { get; set; }
    }
}
