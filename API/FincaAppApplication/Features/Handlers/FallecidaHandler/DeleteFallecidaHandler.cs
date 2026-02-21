using FincaAppApplication.Features.Requests.FallecidaRequest;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.FallecidaHandler
{
    public class DeleteFallecidaHandler : IRequestHandler<DeleteFallecidaRequest>
    {
        private readonly IFallecidaRepository _fallecidaRepository;

        public DeleteFallecidaHandler(IFallecidaRepository fallecidaRepository)
        {
            _fallecidaRepository = fallecidaRepository;
        }

        public async Task Handle(DeleteFallecidaRequest request, CancellationToken cancellationToken)
        {
            var fallecida = await _fallecidaRepository.GetByIdAsync(request.Id, cancellationToken);
            if (fallecida == null)
                throw new KeyNotFoundException();

            await _fallecidaRepository.DeleteAsync(fallecida, cancellationToken);
        }
    }
}
