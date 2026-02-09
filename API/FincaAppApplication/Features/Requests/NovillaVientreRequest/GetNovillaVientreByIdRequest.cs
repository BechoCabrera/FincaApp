using FincaAppApplication.DTOs.NovillaVientre;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Requests.NovillaVientreRequest
{
    public class GetNovillaVientreByIdRequest : IRequest<NovillaVientreDto>
    {
        public Guid Id { get; set; }
    }
}
