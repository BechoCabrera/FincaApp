using FincaAppApi.DTOs.Toro;
using MediatR;

namespace FincaAppApi.Application.Features.Requests.ToroRequest
{
    public class SearchToroRequest : IRequest<List<ToroDto>>
    {
        public string? Nombre { get; set; }
        public string? Numero { get; set; }
    }
}
