using FincaAppApi.DTOs.Toro;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Requests.ToroRequest
{
    public class GetToroByIdRequest : IRequest<ToroDto>
    {
        public Guid Id { get; set; }
    }
}
