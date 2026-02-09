using FincaAppApplication.Features.Requests.CriaHembraRequest;
using FincaAppApplication.Features.Requests.RecriasHembraRecuest;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.RecriasHembraHandler
{
    public class DeleteRecriaHembraHandler : IRequestHandler<DeleteRecriaHembraRequest>
    {
        private readonly IRecriaHembraRepository _repository;

        public DeleteRecriaHembraHandler(IRecriaHembraRepository repository)
        {
            _repository = repository;
        }

        public async Task Handle(DeleteRecriaHembraRequest request, CancellationToken cancellationToken)
        {
            var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
            if (entity == null) return;
            await _repository.DeleteAsync(entity, cancellationToken);
        }
    }
}
