using MediatR;
using FincaAppApplication.DTOs.CriaHembra;

namespace FincaAppApplication.Features.Requests.CriaHembraRequest
{
    public class CreateCriaHembraRequest : IRequest<Guid>
    {
        public CreateCriaHembraDto Dto { get; set; } = null!;
    }
}