using AutoMapper;
using FincaAppApi.Application.Features.Requests.ToroRequest;
using FincaAppApi.Domain.Interfaces;
using FincaAppApi.DTOs.Toro;
using MediatR;

namespace FincaAppApi.Application.Features.Handlers.ToroHandler
{
    public class UpdateToroHandler : IRequestHandler<UpdateToroRequest, ToroDto>
    {
        private readonly IToroRepository _toroRepository;
        private readonly IMapper _mapper;

        public UpdateToroHandler(IToroRepository toroRepository, IMapper mapper)
        {
            _toroRepository = toroRepository;
            _mapper = mapper;
        }

        public async Task<ToroDto> Handle(UpdateToroRequest request, CancellationToken cancellationToken)
        {
            var toro = await _toroRepository.GetByIdAsync(request.Id);
            if (toro == null)
            {
                throw new KeyNotFoundException("Toro no encontrado.");
            }

            toro.Numero = request.Numero;
            toro.Nombre = request.Nombre;
            toro.FechaNacimiento = request.FechaNacimiento;
            toro.Peso = request.Peso;
            toro.Finca = request.Finca;

            await _toroRepository.UpdateAsync(toro);
            var toroDto = _mapper.Map<ToroDto>(toro);
            return toroDto;
        }
    }
}
