using AutoMapper;
using MediatR;
using FincaAppApplication.Features.Requests.ToroRequest;
using FincaAppDomain.Interfaces;
using FincaAppApi.DTOs.Toro;

namespace FincaAppApplication.Features.Handlers.ToroHandler;

public class GetToroByIdHandler : IRequestHandler<GetToroByIdRequest, ToroDto>
{
    private readonly IToroRepository _toroRepository;
    private readonly IMapper _mapper;

    public GetToroByIdHandler(IToroRepository toroRepository, IMapper mapper)
    {
        _toroRepository = toroRepository;
        _mapper = mapper;
    }

    public async Task<ToroDto> Handle(GetToroByIdRequest request, CancellationToken cancellationToken)
    {
        var toro = await _toroRepository.GetByIdAsync(request.Id, cancellationToken);

        if (toro is null)
            throw new KeyNotFoundException("Toro no encontrado.");

        return _mapper.Map<ToroDto>(toro);
    }
}
