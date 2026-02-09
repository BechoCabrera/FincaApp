using FincaAppApplication.Features.Requests.NovillaVientreRequest;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.NovillaVientreHandler
{
    public class DeleteNovillaVientreHandler : IRequestHandler<DeleteNovillaVientreRequest>
    {
        private readonly INovillaVientreRepository _repository;

        public DeleteNovillaVientreHandler(INovillaVientreRepository repository)
        {
            _repository = repository;
        }

        public async Task Handle(DeleteNovillaVientreRequest request, CancellationToken cancellationToken)
        {
            var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
            if (entity == null) return;
            await _repository.DeleteAsync(entity, cancellationToken);
        }
    }
}
