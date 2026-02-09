public interface ICriaHembraRepository
{
    Task AddAsync(CriaHembra entity, CancellationToken ct);
    Task UpdateAsync(CriaHembra entity, CancellationToken ct);
    Task DeleteAsync(CriaHembra entity, CancellationToken ct);
    Task<CriaHembra?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<List<CriaHembra>> GetAllAsync(CancellationToken ct);
}
