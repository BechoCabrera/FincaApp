using MediatR;
using FincaAppApplication.DTOs.Finca;

namespace FincaAppApplication.Features.Requests.FincaRequest
{
    public class UpdateFincaRequest : IRequest<FincaDto>
    {
        public Guid Id { get; set; }
        public string Codigo { get; set; } = null!;
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public bool IsActive { get; set; }
    }
}
