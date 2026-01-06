using AutoMapper;
using MediatR;
using FincaAppDomain.Interfaces;
using FincaAppApi.Application.Features.Requests.ToroRequest;
using FincaAppApi.DTOs.Toro;

namespace FincaAppApplication.Features.Handlers.ToroHandler;

public class SearchToroHandler : IRequestHandler<SearchToroRequest, List<ToroDto>>
{
    private readonly IToroRepository _toroRepository;
    private readonly IMapper _mapper;

    public SearchToroHandler(IToroRepository toroRepository, IMapper mapper)
    {
        _toroRepository = toroRepository;
        _mapper = mapper;
    }

    public async Task<List<ToroDto>> Handle(SearchToroRequest request, CancellationToken cancellationToken)
    {
        var toros = await _toroRepository.SearchAsync(
            request.Nombre,
            request.Numero,
            cancellationToken);

        return _mapper.Map<List<ToroDto>>(toros);
    }
}
