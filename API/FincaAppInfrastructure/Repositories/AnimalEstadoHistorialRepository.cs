using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace FincaAppInfrastructure.Repositories;
public class AnimalEstadoHistorialRepository
    : IAnimalEstadoHistorialRepository
{
    private readonly FincaDbContext _context;

    public AnimalEstadoHistorialRepository(FincaDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(AnimalEstadoHistorial historial)
    {
        await _context.AnimalEstados.AddAsync(historial);
        await _context.SaveChangesAsync();
    }

    public async Task<List<AnimalEstadoHistorial>> GetByAnimalAsync(Guid animalId)
    {
        return await _context.AnimalEstados
            .Where(h => h.AnimalId == animalId)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();
    }
}