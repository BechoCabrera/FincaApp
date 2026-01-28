using AutoMapper;
using FincaAppApplication.DTOs.Proxima;
using FincaAppApplication.Features.Requests.ProximasRequest;
using FincaAppDomain.Repositories;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.ProximaHandler
{
    public class UpdateProximaHandler : IRequestHandler<UpdateProximaRequest, ProximaDto>
    {
        private readonly IProximaRepository _proximaRepository;
        private readonly IMapper _mapper;

        public UpdateProximaHandler(IProximaRepository proximaRepository, IMapper mapper)
        {
            _proximaRepository = proximaRepository;
            _mapper = mapper;
        }

        public async Task<ProximaDto> Handle(UpdateProximaRequest request, CancellationToken cancellationToken)
        {
            var entity = await _proximaRepository.GetByIdAsync(request.Id, cancellationToken);
            if (entity == null)
                throw new KeyNotFoundException("Registro no encontrado");

            entity.FechaDestete = request.FechaDestete;
            entity.FPalpacion = request.FPalpacion;
            entity.DPrenez = request.DPrenez;
            entity.Detalles = request.Detalles;
            entity.UpdatedAt = DateTime.UtcNow;

            await _proximaRepository.UpdateAsync(entity, cancellationToken);

            return _mapper.Map<ProximaDto>(entity);
        }
    }
}
