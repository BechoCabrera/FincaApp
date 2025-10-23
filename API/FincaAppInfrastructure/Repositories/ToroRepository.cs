using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FincaAppInfrastructure.Repositories
{
    public class ToroRepository : IToroRepository
    {
        private readonly FincaDbContext _context;

        public ToroRepository(FincaDbContext context)
        {
            _context = context;
        }

        public async Task<Toro> AddAsync(Toro toro)
        {
            _context.Toros.Add(toro);
            await _context.SaveChangesAsync();
            return toro;
        }

        public Task<Toro?> GetByIdAsync(Guid id) => _context.Toros.FindAsync(id).AsTask();


        public async Task<IEnumerable<Toro>> GetAllAsync()
        {
            return await _context.Toros.ToListAsync();
        }

        public async Task<Toro> UpdateAsync(Toro toro)
        {
            _context.Toros.Update(toro);
            await _context.SaveChangesAsync();
            return toro;
        }

        public async Task DeleteAsync(Guid id)
        {
            var toro = await _context.Toros.FindAsync(id);
            if (toro != null)
            {
                _context.Toros.Remove(toro);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<Toro>> SearchAsync(string? nombre, string? numero)
        {
            // Comienza la consulta sobre la tabla Toros
            var query = _context.Toros.AsQueryable();

            // Si 'nombre' no es null o vacío, agrega un filtro de búsqueda por nombre
            if (!string.IsNullOrEmpty(nombre))
            {
                query = query.Where(t => t.Nombre.Contains(nombre));  // Busca el nombre dentro de los toros
            }

            // Si 'numero' no es null o vacío, agrega un filtro de búsqueda por número
            if (!string.IsNullOrEmpty(numero))
            {
                query = query.Where(t => t.Numero.Contains(numero));  // Busca el número dentro de los toros
            }

            // Ejecuta la consulta y devuelve los resultados como una lista de toros
            return await query.ToListAsync();
        }

    }
}
