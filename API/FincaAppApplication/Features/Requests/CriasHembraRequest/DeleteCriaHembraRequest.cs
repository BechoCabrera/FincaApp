using MediatR;

namespace FincaAppApplication.Features.Requests.CriaHembraRequest
{
    public class DeleteCriaHembraRequest : IRequest<Guid>
    {
        public Guid Id { get; set; }
    }
}