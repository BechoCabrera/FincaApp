using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Requests.ProximasRequest
{
    public class DeleteProximaRequest : IRequest<Unit>
    {
        public Guid Id { get; set; }
    }
}
