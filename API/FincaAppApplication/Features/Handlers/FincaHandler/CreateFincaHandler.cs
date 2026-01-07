using AutoMapper;
using FincaAppApplication.DTOs.Finca;
using FincaAppApplication.Features.Requests.FincaRequest;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using MediatR;

namespace FincaAppApplication.Features.Handlers.FincaHandler
{
    public class CreateFincaHandler : IRequestHandler<CreateFincaRequest, FincaDto>
    {
        private readonly IFincaRepository _fincaRepository;
        private readonly IMapper _mapper;

        public CreateFincaHandler(
            IFincaRepository fincaRepository,
            IMapper mapper)
        {
            _fincaRepository = fincaRepository;
            _mapper = mapper;
        }

        public async Task<FincaDto> Handle(CreateFincaRequest request, CancellationToken cancellationToken)
        {
            var finca = new Finca
            {
                Id = Guid.NewGuid(),
                Codigo = request.Codigo,
                Nombre = request.Nombre,
                Descripcion = request.Descripcion,
                IsActive = true
            };

            await _fincaRepository.AddAsync(finca);

            return _mapper.Map<FincaDto>(finca);
        }
    }
}
