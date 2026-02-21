using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Requests.VentaRequest
{
    public class DeleteVentaRequest : IRequest
    {
        public Guid Id { get; set; }
    }
}
