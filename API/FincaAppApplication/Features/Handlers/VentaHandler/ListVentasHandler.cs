using FincaAppApplication.DTOs.Venta;
using FincaAppApplication.Features.Requests.VentaRequest;
using FincaAppDomain.Interfaces;
using MediatR;


namespace FincaAppApplication.Features.Handlers.VentaHandler
{
    public class ListVentasHandler : IRequestHandler<ListVentasRequest, List<VentaDto>>
    {
        private readonly IVentaRepository _ventaRepository;

        public ListVentasHandler(IVentaRepository ventaRepository)
        {
            _ventaRepository = ventaRepository;
        }

        public async Task<List<VentaDto>> Handle(ListVentasRequest request, CancellationToken cancellationToken)
        {
            // Aquí puedes adaptar el tenantId si lo necesitas
            var ventas = await _ventaRepository.GetAllByTenantAsync(Guid.Empty, cancellationToken);
            return ventas.Select(v => new VentaDto
            {
                Categoria = v.Categoria,
                AnimalId = v.AnimalId,
                FincaId = Guid.TryParse(v.TenantId, out var fincaId) ? fincaId : Guid.Empty,
                FechaVenta = v.FechaVenta,
                Comprador = v.Comprador,
                Precio = v.Precio,
                Notas = v.Notas
            }).ToList();
        }
    }
}
