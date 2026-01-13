using Microsoft.EntityFrameworkCore;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Data;

namespace FincaAppInfrastructure.Repositories;

public class EscoteraRepository : IEscoteraRepository
{
    private readonly FincaDbContext _db;

    public EscoteraRepository(FincaDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(Escoteras escotera, CancellationToken ct)
    {
        _db.Escoteras.Add(escotera);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<List<Escoteras>> GetAllAsync(CancellationToken ct)
    {
        return await _db.Escoteras
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<Escoteras?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _db.Escoteras
            .FirstOrDefaultAsync(x => x.Id == id, ct);
    }

    public async Task<bool> ExistsNumeroEscoteraAsync(string numeroEscotera, Guid? excludeId, CancellationToken ct)
    {
        return await _db.Escoteras.AnyAsync(x =>
            x.Numero == numeroEscotera &&
            (excludeId == null || x.Id != excludeId),
            ct
        );
    }
    public async Task UpdateAsync(Escoteras escotera, CancellationToken ct)
    {
        _db.Escoteras.Update(escotera);
        await _db.SaveChangesAsync(ct);
    }
    public async Task DeleteAsync(Escoteras escotera, CancellationToken ct)
    {
        _db.Escoteras.Remove(escotera);
        await _db.SaveChangesAsync(ct);
    }

}
