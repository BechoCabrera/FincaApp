using FincaAppDomain.Entities;

namespace FincaAppDomain.Interfaces;

public interface IToroRepository
{
    Task AddAsync(Toro toro, CancellationToken cancellationToken);
    Task<Toro?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<IReadOnlyList<Toro>> SearchAsync(string? nombre, string? numero, CancellationToken cancellationToken);
    Task UpdateAsync(Toro toro, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
