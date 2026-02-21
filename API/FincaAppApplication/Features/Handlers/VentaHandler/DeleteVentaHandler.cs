using FincaAppApplication.Features.Requests.VentaRequest;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.VentaHandler
{
    public class DeleteVentaHandler : IRequestHandler<DeleteVentaRequest>
    {
        private readonly IVentaRepository _ventaRepository;

        public DeleteVentaHandler(IVentaRepository ventaRepository)
        {
            _ventaRepository = ventaRepository;
        }

        public async Task Handle(DeleteVentaRequest request, CancellationToken cancellationToken)
        {
            var venta = await _ventaRepository.GetByIdAsync(request.Id, cancellationToken);
            if (venta == null)
                throw new KeyNotFoundException();

            await _ventaRepository.DeleteAsync(venta, cancellationToken);
        }
    }
}
