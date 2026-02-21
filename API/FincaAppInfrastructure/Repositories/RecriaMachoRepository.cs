using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppInfrastructure.Repositories
{

    public class RecriaMachoRepository : IRecriaMachoRepository
    {
        private readonly FincaDbContext _context;

        public RecriaMachoRepository(FincaDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(RecriaMacho entity, CancellationToken cancellationToken)
        {
            _context.RecriasMachos.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<RecriaMacho?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            return await _context.RecriasMachos
                .Include(r => r.Finca)
                .Include(r => r.Madre)
                .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
        }

        public async Task<IReadOnlyList<RecriaMacho>> SearchAsync(string? nombre, CancellationToken cancellationToken)
        {
            IQueryable<RecriaMacho> query = _context.RecriasMachos
                .Include(r => r.Finca)
                .Include(r => r.Madre);

            if (!string.IsNullOrWhiteSpace(nombre))
                query = query.Where(r => r.Nombre.Contains(nombre));

            return await query.ToListAsync(cancellationToken);
        }

        public async Task UpdateAsync(RecriaMacho entity, CancellationToken cancellationToken)
        {
            _context.RecriasMachos.Update(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
        {
            var entity = await _context.RecriasMachos.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
            if (entity is null)
                throw new KeyNotFoundException("Recría macho no encontrada.");

            _context.RecriasMachos.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
