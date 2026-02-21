using AutoMapper;
using FincaAppApplication.DTOs.RecriasMacho;
using FincaAppApplication.Features.Requests.RecriasMachoRequest;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.RecriasMachoHandler
{

    public class UpdateRecriaMachoHandler : IRequestHandler<UpdateRecriaMachoRequest, RecriaMachoDto>
    {
        private readonly IRecriaMachoRepository _repo;
        private readonly IMapper _mapper;

        public UpdateRecriaMachoHandler(IRecriaMachoRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<RecriaMachoDto> Handle(UpdateRecriaMachoRequest request, CancellationToken ct)
        {
            var entity = await _repo.GetByIdAsync(request.Id, ct);
            if (entity is null)
                throw new KeyNotFoundException("Recría macho no encontrada.");

            entity.Nombre = request.Nombre;
            entity.FechaNac = request.FechaNac;
            entity.PesoKg = request.PesoKg;
            entity.Color = request.Color;
            entity.Propietario = request.Propietario;
            entity.FincaId = request.FincaId;
            entity.MadreId = request.MadreId;
            entity.Detalles = request.Detalles;
            entity.FechaDestete = request.FechaDestete;

            await _repo.UpdateAsync(entity, ct);

            return _mapper.Map<RecriaMachoDto>(entity);
        }
    }
}
