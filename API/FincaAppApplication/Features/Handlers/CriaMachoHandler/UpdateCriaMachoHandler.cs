using AutoMapper;
using FincaAppApplication.Features.Requests.CriaMachoRequest;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.CriaMachoHandler
{
    public class UpdateCriaMachoHandler : IRequestHandler<UpdateCriaMachoRequest, Guid>
    {
        private readonly ICriaMachoRepository _repo;
        private readonly IMapper _mapper;

        public UpdateCriaMachoHandler(ICriaMachoRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<Guid> Handle(UpdateCriaMachoRequest request, CancellationToken ct)
        {
            var entity = await _repo.GetByIdAsync(request.Id, ct)
                ?? throw new KeyNotFoundException("Cría macho no encontrada.");

            entity.Nombre = request.Nombre;
            entity.FechaNac = request.FechaNac;
            entity.Color = request.Color;
            entity.Propietario = request.Propietario;
            entity.PesoKg = request.PesoKg.HasValue ? (decimal?)request.PesoKg.Value : null;
            entity.FincaId = request.FincaId;
            entity.MadreId = request.MadreId;
            entity.MadreNombre = request.MadreNombre;
            entity.Detalles = request.Detalles;

            await _repo.UpdateAsync(entity, ct);

            return entity.Id;
        }
    }
}
