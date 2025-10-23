using AutoMapper;
using FincaAppApi.Application.Features.Requests.ToroRequest;
using FincaAppDomain.Entities;
using FincaAppApi.DTOs.Toro;
using FincaAppDomain.Interfaces;
using MediatR;

namespace FincaAppApi.Application.Features.Handlers.ToroHandler
{
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
            List<Toro> toros = await _toroRepository.SearchAsync(request.Nombre, request.Numero);
            var torosDto = _mapper.Map<List<ToroDto>>(toros);
            return torosDto;
        }
    }
}
