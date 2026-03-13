using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FincaAppInfrastructure.Repositories
{
    public class AnimalMovimientoRepository : IAnimalMovimientoRepository
    {
        private readonly FincaDbContext _context;

        public AnimalMovimientoRepository(FincaDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(AnimalMovimiento movimiento)
        {
            await _context.AnimalMovimientos.AddAsync(movimiento);
            await _context.SaveChangesAsync();
        }

        public async Task<List<AnimalMovimiento>> GetByAnimalAsync(Guid animalId)
        {
            return await _context.AnimalMovimientos
                .Where(m => m.AnimalId == animalId)
                .OrderByDescending(m => m.Fecha)
                .ToListAsync();
        }
    }
}
