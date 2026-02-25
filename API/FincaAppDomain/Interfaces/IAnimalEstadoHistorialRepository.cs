using FincaAppDomain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppDomain.Interfaces
{
    public interface IAnimalEstadoHistorialRepository
    {
        Task AddAsync(AnimalEstadoHistorial historial);
    }
}
