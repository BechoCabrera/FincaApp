using System;
using System.Threading.Tasks;

namespace FincaAppApplication.Common;

public interface IUnitOfWork
{
    Task<T> ExecuteAsync<T>(Func<Task<T>> action);
    Task ExecuteAsync(Func<Task> action);
}
