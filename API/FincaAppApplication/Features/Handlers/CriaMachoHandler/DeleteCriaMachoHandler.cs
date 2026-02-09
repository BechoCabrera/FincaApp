using FincaAppApplication.Features.Requests.CriaMachoRequest;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.CriaMachoHandler
{
    public class DeleteCriaMachoHandler : IRequestHandler<DeleteCriaMachoRequest, Guid>
    {
        private readonly ICriaMachoRepository _repo;

        public DeleteCriaMachoHandler(ICriaMachoRepository repo)
        {
            _repo = repo;
        }

        public async Task<Guid> Handle(DeleteCriaMachoRequest request, CancellationToken ct)
        {
            var entity = await _repo.GetByIdAsync(request.Id, ct);

            if (entity == null)
                throw new KeyNotFoundException("Cría macho no encontrada.");

            await _repo.DeleteAsync(entity, ct);

            return entity.Id;
        }
    }
}
