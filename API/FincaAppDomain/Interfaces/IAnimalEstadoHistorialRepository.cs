using FincaAppDomain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FincaAppDomain.Interfaces
{
    public interface IAnimalEstadoHistorialRepository
    {
        Task AddAsync(AnimalEstadoHistorial historial);
        Task<List<AnimalEstadoHistorial>> GetByAnimalAsync(Guid animalId);
    }
}
