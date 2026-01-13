using MediatR;

namespace FincaAppApplication.Features.Requests.Escotera;

public class DeleteEscoteraRequest : IRequest<Guid>
{
    public Guid Id { get; set; }
}
