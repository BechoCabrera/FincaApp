using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FincaAppInfrastructure.Repositories
{
    public class RecriaHembraRepository : IRecriaHembraRepository
    {
        private readonly FincaDbContext _context;

        public RecriaHembraRepository(FincaDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(RecriaHembra entity, CancellationToken ct)
        {
            await _context.RecriasHembras.AddAsync(entity, ct);
            await _context.SaveChangesAsync(ct);
        }

        public async Task UpdateAsync(RecriaHembra entity, CancellationToken ct)
        {
            _context.RecriasHembras.Update(entity);
            await _context.SaveChangesAsync(ct);
        }

        public async Task DeleteAsync(RecriaHembra entity, CancellationToken ct)
        {
            _context.RecriasHembras.Remove(entity);
            await _context.SaveChangesAsync(ct);
        }

        public async Task<RecriaHembra?> GetByIdAsync(Guid id, CancellationToken ct)
        {
            return await _context.RecriasHembras.FirstOrDefaultAsync(x => x.Id == id, ct);
        }

        public async Task<List<RecriaHembra>> GetAllAsync(CancellationToken ct)
        {
            return await _context.RecriasHembras.ToListAsync(ct);
        }
    }
}
