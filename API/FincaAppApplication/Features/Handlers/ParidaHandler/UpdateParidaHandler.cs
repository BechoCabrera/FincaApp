using FincaAppApplication.Features.Requests.ParidaRequest;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.ParidaHandler
{
    internal class UpdateParidaHandler : IRequestHandler<UpdateParidaRequest, Guid>
    {
        private readonly IParidaRepository _repo;

        public UpdateParidaHandler(IParidaRepository paridaRepository)
        {
            _repo = paridaRepository;
        }

        public async Task<Guid> Handle(UpdateParidaRequest request, CancellationToken ct)
        {
            var entity = await _repo.GetByIdAsync(request.Id, ct)
                ?? throw new Exception("Parida no encontrada");

            // 🔴 VALIDAR NUMERO DUPLICADO (EXCLUYENDO EL MISMO ID)
            var exists = await _repo.ExistsNumeroAsync(
                request.Numero,
                request.Id,
                ct);

            if (exists)
                throw new Exception($"Ya existe una parida con el número {request.Numero}");

            // ✅ ACTUALIZAR
            entity.Numero = request.Numero;
            entity.Nombre = request.Nombre;
            entity.GeneroCria = request.GeneroCria;

            entity.FechaParida = request.FechaParida;
            entity.FechaPalpacion = request.FechaPalpacion;
            entity.FechaNacimiento = request.FechaNacimiento;

            entity.Color = request.Color;
            entity.TipoLeche = request.TipoLeche;
            entity.Procedencia = request.Procedencia;
            entity.Propietario = request.Propietario;
            entity.Observaciones = request.Observaciones;

            entity.FincaId = request.FincaId;

            await _repo.UpdateAsync(entity, ct);

            return entity.Id;
        }
    }
}
