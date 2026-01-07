using MediatR;
using FincaAppApplication.Features.Requests.FincaRequest;
using FincaAppDomain.Interfaces;

namespace FincaAppApplication.Features.Handlers.FincaHandler
{
    public class DeleteFincaHandler : IRequestHandler<DeleteFincaRequest, Unit>
    {
        private readonly IFincaRepository _fincaRepository;

        public DeleteFincaHandler(IFincaRepository fincaRepository)
        {
            _fincaRepository = fincaRepository;
        }

        public async Task<Unit> Handle(DeleteFincaRequest request, CancellationToken cancellationToken)
        {
            var finca = await _fincaRepository.GetByIdAsync(request.Id);
            if (finca == null)
                throw new KeyNotFoundException("Finca no encontrada.");

            await _fincaRepository.DeleteAsync(request.Id);

            return Unit.Value;
        }
    }
}
