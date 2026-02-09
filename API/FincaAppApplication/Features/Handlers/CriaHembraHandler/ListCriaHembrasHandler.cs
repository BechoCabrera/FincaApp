using AutoMapper;
using FincaAppApplication.DTOs.CriaHembra;
using FincaAppApplication.Features.Requests.CriaHembraRequest;
using FincaAppDomain.Interfaces;
using MediatR;

namespace FincaAppApplication.Features.Handlers.CriaHembraHandler
{
    public class ListCriaHembrasHandler : IRequestHandler<ListCriaHembrasRequest, List<CriaHembraDto>>
    {
        private readonly ICriaHembraRepository _repository;
        private readonly IMapper _mapper;

        public ListCriaHembrasHandler(ICriaHembraRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<CriaHembraDto>> Handle(ListCriaHembrasRequest request, CancellationToken cancellationToken)
        {
            var entities = await _repository.GetAllAsync(cancellationToken);
            return _mapper.Map<List<CriaHembraDto>>(entities);
        }
    }
}