using FincaAppDomain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FincaAppDomain.Interfaces
{
    public interface IAnimalMovimientoRepository
    {
        Task AddAsync(AnimalMovimiento movimiento);
        Task<List<AnimalMovimiento>> GetByAnimalAsync(Guid animalId);
    }
}
