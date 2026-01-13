using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FincaAppInfrastructure.Repositories;

public class ParidaRepository : IParidaRepository
{
    private readonly FincaDbContext _context;

    public ParidaRepository(FincaDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Paridas parida, CancellationToken cancellationToken)
    {
        await _context.Paridas.AddAsync(parida, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<Paridas>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _context.Paridas
            .AsNoTracking()
            .OrderByDescending(p => p.FechaParida)
            .ToListAsync(cancellationToken);
    }

    public async Task<Paridas?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.Paridas
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<bool> ExistsByNumeroAsync(string numero,

    CancellationToken cancellationToken)
    {
        return await _context.Paridas
            .AsNoTracking()
            .AnyAsync(p =>
                p.Numero == numero,
                cancellationToken);
    }

    public async Task<bool> ExistsNumeroAsync(string numero, Guid? excludeId, CancellationToken ct)
    {
        return await _context.Paridas.AnyAsync(p =>
            p.Numero == numero &&
            (!excludeId.HasValue || p.Id != excludeId.Value),
            ct);
    }

    public async Task UpdateAsync(Paridas parida, CancellationToken ct)
    {
        _context.Paridas.Update(parida);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Paridas parida, CancellationToken ct)
    {
        _context.Paridas.Remove(parida);
        await _context.SaveChangesAsync(ct);
    }

}
