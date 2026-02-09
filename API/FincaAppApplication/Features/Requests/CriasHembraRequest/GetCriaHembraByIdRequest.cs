using MediatR;
using FincaAppApplication.DTOs.CriaHembra;

namespace FincaAppApplication.Features.Requests.CriaHembraRequest
{
    public class GetCriaHembraByIdRequest : IRequest<CriaHembraDto?>
    {
        public Guid Id { get; set; }
    }
}