using FincaAppApplication.DTOs.Finca;
using MediatR;

namespace FincaAppApplication.Features.Requests.FincaRequest
{
    public class CreateFincaRequest : IRequest<FincaDto>
    {
        public string Codigo { get; set; } = null!;
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
    }
}
