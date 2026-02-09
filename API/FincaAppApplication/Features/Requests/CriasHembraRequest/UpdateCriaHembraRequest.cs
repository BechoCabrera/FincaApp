using MediatR;
using FincaAppApplication.DTOs.CriaHembra;

namespace FincaAppApplication.Features.Requests.CriaHembraRequest
{
    public class UpdateCriaHembraRequest : IRequest<Guid>
    {
        public Guid Id { get; set; }
        public CreateCriaHembraDto Dto { get; set; } = null!;
    }
}