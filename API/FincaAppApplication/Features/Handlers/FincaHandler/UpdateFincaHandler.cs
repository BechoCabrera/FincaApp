using AutoMapper;
using MediatR;
using FincaAppApplication.Features.Requests.FincaRequest;
using FincaAppDomain.Interfaces;
using FincaAppApplication.DTOs.Finca;

namespace FincaAppApplication.Features.Handlers.FincaHandler
{
    public class UpdateFincaHandler : IRequestHandler<UpdateFincaRequest, FincaDto>
    {
        private readonly IFincaRepository _fincaRepository;
        private readonly IMapper _mapper;

        public UpdateFincaHandler(
            IFincaRepository fincaRepository,
            IMapper mapper)
        {
            _fincaRepository = fincaRepository;
            _mapper = mapper;
        }

        public async Task<FincaDto> Handle(UpdateFincaRequest request, CancellationToken cancellationToken)
        {
            var finca = await _fincaRepository.GetByIdAsync(request.Id);
            if (finca == null)
                throw new KeyNotFoundException("Finca no encontrada.");

            finca.Codigo = request.Codigo;
            finca.Nombre = request.Nombre;
            finca.Descripcion = request.Descripcion;
            finca.IsActive = request.IsActive;

            await _fincaRepository.UpdateAsync(finca);

            return _mapper.Map<FincaDto>(finca);
        }
    }
}
