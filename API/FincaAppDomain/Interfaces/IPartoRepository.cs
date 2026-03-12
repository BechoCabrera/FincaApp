using FincaAppDomain.Entities;

namespace FincaAppDomain.Interfaces;

public interface IPartoRepository
{
    Task<Parto?> GetByIdAsync(Guid id);

    Task<List<Parto>> GetByMadreAsync(Guid madreId);

    Task AddAsync(Parto parto);

    Task UpdateAsync(Parto parto);

    Task<List<Parto>> GetAllAsync(Guid? fincaId = null, int page = 1, int pageSize = 20);
}
