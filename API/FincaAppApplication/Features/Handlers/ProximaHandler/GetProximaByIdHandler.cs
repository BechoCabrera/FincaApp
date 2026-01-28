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
    public class GetProximaByIdHandler : IRequestHandler<GetProximaByIdRequest, ProximaDto>
    {
        private readonly IProximaRepository _proximaRepository;
        private readonly IMapper _mapper;

        public GetProximaByIdHandler(IProximaRepository proximaRepository, IMapper mapper)
        {
            _proximaRepository = proximaRepository;
            _mapper = mapper;
        }

        public async Task<ProximaDto> Handle(GetProximaByIdRequest request, CancellationToken cancellationToken)
        {
            var entity = await _proximaRepository.GetByIdAsync(request.Id, cancellationToken);
            if (entity == null)
                throw new KeyNotFoundException("Registro no encontrado");

            return _mapper.Map<ProximaDto>(entity);
        }
    }
}
