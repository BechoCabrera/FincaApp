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
    public class AnimalPalpacionRepository : IAnimalPalpacionRepository
    {
        private readonly FincaDbContext _context;

        public AnimalPalpacionRepository(FincaDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(AnimalPalpacion palpacion)
        {
            await _context.Set<AnimalPalpacion>().AddAsync(palpacion);
            await _context.SaveChangesAsync();
        }

        public async Task<List<AnimalPalpacion>> GetByAnimalAsync(Guid animalId)
        {
            return await _context.AnimalPalpaciones
                .Where(p => p.AnimalId == animalId)
                .OrderByDescending(p => p.FechaPalpacion)
                .ToListAsync();
        }
    }
}
