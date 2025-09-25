using AutoMapper;
using FincaAppApi.Application.Features.Requests.ToroRequest;
using FincaAppApi.Domain.Entities;
using FincaAppApi.Domain.Interfaces;
using FincaAppApi.DTOs.Toro;
using MediatR;

public class CreateToroHandler : IRequestHandler<CreateToroRequest, ToroDto>
{
    private readonly IToroRepository _toroRepository;
    private readonly IMapper _mapper;

    public CreateToroHandler(IToroRepository toroRepository, IMapper mapper)
    {
        _toroRepository = toroRepository;
        _mapper = mapper;
    }

    public async Task<ToroDto> Handle(CreateToroRequest request, CancellationToken cancellationToken)
    {
        var toro = new Toro
        {
            Id = Guid.NewGuid(),
            Numero = request.Numero,
            Nombre = request.Nombre,
            FechaNacimiento = request.FechaNacimiento,
            Peso = request.Peso,
            Finca = request.Finca
        };

        await _toroRepository.AddAsync(toro);

        // Mapeo de la entidad Toro a ToroDto
        var toroDto = _mapper.Map<ToroDto>(toro);
        return toroDto;
    }
}
