using FincaAppDomain.Entities;

namespace FincaAppDomain.Interfaces;

public interface IParidaRepository
{
    Task AddAsync(Parida parida, CancellationToken cancellationToken);
    Task<List<Parida>> GetAllAsync(CancellationToken cancellationToken);
    Task<Parida?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
}
