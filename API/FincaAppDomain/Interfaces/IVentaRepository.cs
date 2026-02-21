using FincaAppDomain.Entities;

namespace FincaAppDomain.Interfaces;

    public interface IVentaRepository
    {
        Task AddAsync(Venta venta, CancellationToken cancellationToken);
        Task<List<Venta>> GetAllByTenantAsync(Guid fincaId, CancellationToken cancellationToken);
        Task<Venta?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
        Task UpdateAsync(Venta venta, CancellationToken cancellationToken);
        Task DeleteAsync(Venta venta, CancellationToken cancellationToken);
    }

