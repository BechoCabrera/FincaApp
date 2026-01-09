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

    public async Task AddAsync(Parida parida, CancellationToken cancellationToken)
    {
        await _context.Paridas.AddAsync(parida, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<Parida>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _context.Paridas
            .AsNoTracking()
            .OrderByDescending(p => p.FechaParida)
            .ToListAsync(cancellationToken);
    }

    public async Task<Parida?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.Paridas
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }
}
