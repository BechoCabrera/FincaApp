using FincaAppApplication.Features.Requests.CriaMachoRequest;
using FincaAppApplication.Features.Requests.RecriasMachoRequest;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.RecriasMachoHandler
{
    public class DeleteRecriaMachoHandler : IRequestHandler<DeleteRecriaMachoRequest>
    {
        private readonly IRecriaMachoRepository _repo;

        public DeleteRecriaMachoHandler(IRecriaMachoRepository repo)
        {
            _repo = repo;
        }

        public async Task Handle(DeleteRecriaMachoRequest request, CancellationToken ct)
        {
            await _repo.DeleteAsync(request.Id, ct);
        }
    }
}
