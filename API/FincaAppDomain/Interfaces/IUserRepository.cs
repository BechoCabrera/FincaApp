using FincaAppDomain.Entities;

namespace FincaAppDomain.Interfaces;

public interface IUserRepository
{
    Task<Usuario?> GetByEmailAsync(string email);
}
