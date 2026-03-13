using FincaAppDomain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FincaAppDomain.Interfaces
{
    public interface IAnimalPalpacionRepository
    {
        Task AddAsync(AnimalPalpacion palpacion);
        Task<List<AnimalPalpacion>> GetByAnimalAsync(Guid animalId);
    }
}
