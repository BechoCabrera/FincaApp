using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FincaAppInfrastructure.Repositories
{
    public class CriaHembraRepository : ICriaHembraRepository
    {
        private readonly FincaDbContext _context;

        public CriaHembraRepository(FincaDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(CriaHembra entity, CancellationToken ct)
        {
            await _context.CriasHembras.AddAsync(entity, ct);
            await _context.SaveChangesAsync(ct);
        }

        public async Task UpdateAsync(CriaHembra entity, CancellationToken ct)
        {
            _context.CriasHembras.Update(entity);
            await _context.SaveChangesAsync(ct);
        }

        public async Task DeleteAsync(CriaHembra entity, CancellationToken ct)
        {
            _context.CriasHembras.Remove(entity);
            await _context.SaveChangesAsync(ct);
        }

        public async Task<CriaHembra?> GetByIdAsync(Guid id, CancellationToken ct)
        {
            return await _context.CriasHembras.FirstOrDefaultAsync(x => x.Id == id, ct);
        }

        public async Task<List<CriaHembra>> GetAllAsync(CancellationToken ct)
        {
            return await _context.CriasHembras.ToListAsync(ct);
        }
    }
}