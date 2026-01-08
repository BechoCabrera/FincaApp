using FincaAppDomain.Entities;

namespace FincaAppDomain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
}
