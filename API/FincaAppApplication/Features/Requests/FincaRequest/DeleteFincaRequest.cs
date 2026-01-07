using MediatR;

namespace FincaAppApplication.Features.Requests.FincaRequest
{
    public class DeleteFincaRequest : IRequest<Unit>
    {
        public Guid Id { get; set; }
    }
}
