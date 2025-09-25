using MediatR;

namespace FincaAppApi.Application.Features.Requests.ToroRequest
{
    public class DeleteToroRequest : IRequest<Unit>
    {
        public Guid Id { get; set; }
    }
}
