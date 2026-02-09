using FincaAppApplication.Features.Requests.CriaHembraRequest;
using FincaAppDomain.Interfaces;
using MediatR;

namespace FincaAppApplication.Features.Handlers.CriaHembraHandler
{
    public class DeleteCriaHembraHandler : IRequestHandler<DeleteCriaHembraRequest, Guid>
    {
        private readonly ICriaHembraRepository _repository;

        public DeleteCriaHembraHandler(ICriaHembraRepository repository)
        {
            _repository = repository;
        }

        public async Task<Guid> Handle(DeleteCriaHembraRequest request, CancellationToken cancellationToken)
        {
            var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
            if (entity == null)
                throw new KeyNotFoundException("Cría hembra no encontrada.");

            await _repository.DeleteAsync(entity, cancellationToken);
            return entity.Id;
        }
    }
}