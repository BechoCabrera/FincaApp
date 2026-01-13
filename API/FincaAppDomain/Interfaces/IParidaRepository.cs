using FincaAppDomain.Entities;

namespace FincaAppDomain.Interfaces;

public interface IParidaRepository
{
    Task AddAsync(Paridas parida, CancellationToken cancellationToken);
    Task<List<Paridas>> GetAllAsync(CancellationToken cancellationToken);
    Task<Paridas?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<bool> ExistsByNumeroAsync(string numero, CancellationToken cancellationToken);
    Task<bool> ExistsNumeroAsync(string numero,Guid? excludeId,CancellationToken ct);
    Task UpdateAsync(Paridas parida, CancellationToken cancellationToken);
    Task DeleteAsync(Paridas parida, CancellationToken ct);

}
