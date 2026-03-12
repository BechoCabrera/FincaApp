using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FincaAppInfrastructure.Repositories;

public class PartoRepository : IPartoRepository
{
    private readonly FincaDbContext _context;

    public PartoRepository(FincaDbContext context)
    {
        _context = context;
    }

    public async Task<Parto?> GetByIdAsync(Guid id)
        => await _context.Partos.FirstOrDefaultAsync(p => p.Id == id);

    public async Task<List<Parto>> GetByMadreAsync(Guid madreId)
        => await _context.Partos.Where(p => p.AnimalMadreId == madreId).ToListAsync();

    public async Task AddAsync(Parto parto)
    {
        await _context.Partos.AddAsync(parto);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Parto parto)
    {
        _context.Partos.Update(parto);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Parto>> GetAllAsync(Guid? fincaId = null, int page = 1, int pageSize = 20)
    {
        var q = _context.Partos.AsQueryable();
        if (fincaId.HasValue)
        {
            q = q.Where(p => p.TenantId == _context.CurrentTenantId && p.Id != Guid.Empty);
            // note: Parto doesn't have FincaId directly; if needed join with Animal or use tenant only
        }

        q = q.OrderByDescending(p => p.FechaParto)
             .Skip((page - 1) * pageSize)
             .Take(pageSize);

        return await q.ToListAsync();
    }
}
