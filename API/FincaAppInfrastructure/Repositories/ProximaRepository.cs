using FincaAppDomain.Entities;
using FincaAppDomain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FincaAppInfrastructure.Data.Repositories;

public class ProximaRepository : IProximaRepository
{
    private readonly FincaDbContext _context;

    public ProximaRepository(FincaDbContext context)
    {
        _context = context;
    }

    public async Task<List<Proxima>> GetAllAsync(CancellationToken ct)
    {
        return await _context.Proximas
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<Proxima?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _context.Proximas
            .FirstOrDefaultAsync(x => x.Id == id, ct);
    }

    public async Task AddAsync(Proxima entity, CancellationToken ct)
    {
        _context.Proximas.Add(entity);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Proxima entity, CancellationToken ct)
    {
        _context.Proximas.Update(entity);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Proxima entity, CancellationToken ct)
    {
        _context.Proximas.Remove(entity);
        await _context.SaveChangesAsync(ct);
    }
}
