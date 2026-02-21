using FincaAppApplication.DTOs.Venta;
using FincaAppApplication.Features.Requests.VentaRequest;
using FincaAppDomain.Interfaces;
using MediatR;


namespace FincaAppApplication.Features.Handlers.VentaHandler
{
    public class UpdateVentaHandler : IRequestHandler<UpdateVentaRequest, VentaDto>
    {
        private readonly IVentaRepository _ventaRepository;

        public UpdateVentaHandler(IVentaRepository ventaRepository)
        {
            _ventaRepository = ventaRepository;
        }

        public async Task<VentaDto> Handle(UpdateVentaRequest request, CancellationToken cancellationToken)
        {
            var venta = await _ventaRepository.GetByIdAsync(request.Id, cancellationToken);
            if (venta == null)
                throw new KeyNotFoundException();

            venta.Categoria = request.Categoria;
            venta.AnimalId = request.AnimalId;
            venta.FechaVenta = request.FechaVenta;
            venta.Comprador = request.Comprador;
            venta.Precio = request.Precio;
            venta.Notas = request.Notas;
            venta.TenantId = request.TenantId;

            await _ventaRepository.UpdateAsync(venta, cancellationToken);

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
