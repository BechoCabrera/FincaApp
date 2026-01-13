using FincaAppDomain.Entities;

public interface IEscoteraRepository
{
    Task AddAsync(Escoteras escotera, CancellationToken ct);
    Task UpdateAsync(Escoteras escotera, CancellationToken ct);
    Task DeleteAsync(Escoteras escotera, CancellationToken ct);

    Task<Escoteras?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<List<Escoteras>> GetAllAsync(CancellationToken ct);

    Task<bool> ExistsNumeroEscoteraAsync(string numero, Guid? excludeId, CancellationToken ct);
}
