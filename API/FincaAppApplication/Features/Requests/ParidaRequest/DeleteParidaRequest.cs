using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Requests.ParidaRequest
{
    public class DeleteParidaRequest : IRequest<Guid>
    {
        public Guid Id { get; set; }
    }
}
