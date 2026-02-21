using FincaAppApplication.DTOs.Venta;
using FincaAppApplication.Features.Requests.VentaRequest;
using FincaAppDomain.Common;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using MediatR;


namespace FincaAppApplication.Features.Handlers.VentaHandler
{
    public class CreateVentaHandler : IRequestHandler<CreateVentaRequest, VentaDto>
    {
        private readonly IVentaRepository _ventaRepository;

        public CreateVentaHandler(IVentaRepository ventaRepository)
        {
            _ventaRepository = ventaRepository;
        }

        public async Task<VentaDto> Handle(CreateVentaRequest request, CancellationToken cancellationToken)
        {
            var venta = new Venta(
                request.Categoria,
                request.AnimalId,
                request.FechaVenta,
                request.Comprador,
                request.Precio,
                request.Notas
            );
            venta.TenantId = request.TenantId;

            await _ventaRepository.AddAsync(venta, cancellationToken);

            return new VentaDto
            {
                Categoria = venta.Categoria,
                AnimalId = venta.AnimalId,
                FincaId = Guid.TryParse(venta.TenantId, out var fincaId) ? fincaId : Guid.Empty,
                FechaVenta = venta.FechaVenta,
                Comprador = venta.Comprador,
                Precio = venta.Precio,
                Notas = venta.Notas
            };
        }
    }
}
