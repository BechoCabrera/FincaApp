using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FincaAppInfrastructure.Repositories;

public class ToroRepository : IToroRepository
{
    private readonly FincaDbContext _context;

    public ToroRepository(FincaDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Toro toro, CancellationToken cancellationToken)
    {
        _context.Toros.Add(toro);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<Toro?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.Toros
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Toro>> SearchAsync(
     string? nombre,
     string? numero,
     CancellationToken cancellationToken)
    {
        IQueryable<Toro> query = _context.Toros
            .Include(t => t.Finca).Include(t => t.Madre);

        // Si tienes una relación de navegación Madre, inclúyela:
        // 

        if (!string.IsNullOrWhiteSpace(nombre))
            query = query.Where(t => t.Nombre.Contains(nombre));

        return await query.ToListAsync(cancellationToken);
    }


    public async Task UpdateAsync(Toro toro, CancellationToken cancellationToken)
    {
        _context.Toros.Update(toro);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var toro = await _context.Toros
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (toro is null)
            throw new KeyNotFoundException("Toro no encontrado.");

        _context.Toros.Remove(toro);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
