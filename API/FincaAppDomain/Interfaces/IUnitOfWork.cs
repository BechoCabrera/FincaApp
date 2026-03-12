using System;
using System.Threading.Tasks;

namespace FincaAppDomain.Interfaces;

public interface IUnitOfWork
{
    Task<T> ExecuteAsync<T>(Func<Task<T>> action);
    Task ExecuteAsync(Func<Task> action);
}
