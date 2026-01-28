using FincaAppDomain.Entities;

namespace FincaAppDomain.Repositories;

public interface IProximaRepository
{
    Task AddAsync(Proxima entity, CancellationToken ct);
    Task UpdateAsync(Proxima entity, CancellationToken ct);
    Task DeleteAsync(Proxima entity, CancellationToken ct);
    Task<Proxima?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<List<Proxima>> GetAllAsync(CancellationToken ct);
}
