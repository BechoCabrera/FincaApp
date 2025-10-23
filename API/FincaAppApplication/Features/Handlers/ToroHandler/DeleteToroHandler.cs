using FincaAppApi.Application.Features.Requests.ToroRequest;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using MediatR;

namespace FincaAppApi.Application.Features.Handlers.ToroHandler
{
    public class DeleteToroHandler : IRequestHandler<DeleteToroRequest, Unit>
    {
        private readonly IToroRepository _toroRepository;

        public DeleteToroHandler(IToroRepository toroRepository)
        {
            _toroRepository = toroRepository;
        }

        public async Task<Unit> Handle(DeleteToroRequest request, CancellationToken cancellationToken)
        {
            Toro? toro = await _toroRepository.GetByIdAsync(request.Id);
            if (toro == null)
            {
                throw new KeyNotFoundException("Toro no encontrado.");
            }

            await _toroRepository.DeleteAsync(toro.Id);

            return Unit.Value; // Esto es correcto para comandos sin retorno
        }
    }
}
