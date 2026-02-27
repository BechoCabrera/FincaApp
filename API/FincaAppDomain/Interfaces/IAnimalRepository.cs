using FincaAppDomain.Entities;
using FincaAppDomain.Enums;

namespace FincaAppDomain.Interfaces;

public interface IAnimalRepository
{
    Task<Animal?> GetByIdAsync(Guid id);
    Task<Animal?> GetByNumeroAreteAsync(string numeroArete);

    Task<List<Animal>> GetByFincaAsync(Guid fincaId);

    Task AddAsync(Animal animal);
    Task UpdateAsync(Animal animal);

    Task<bool> ExistsNumeroAreteAsync(string numeroArete);

    Task<List<Animal>> GetAllAsync(
        TipoAnimal? tipo = null,
        PropositoAnimal? proposito = null,
        string? estado = null,
        int page = 1,
        int pageSize = 20);
}