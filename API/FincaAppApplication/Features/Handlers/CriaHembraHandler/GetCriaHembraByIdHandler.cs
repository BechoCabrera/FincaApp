using AutoMapper;
using FincaAppApplication.DTOs.CriaHembra;
using FincaAppApplication.Features.Requests.CriaHembraRequest;
using FincaAppDomain.Interfaces;
using MediatR;

namespace FincaAppApplication.Features.Handlers.CriaHembraHandler
{
    public class GetCriaHembraByIdHandler : IRequestHandler<GetCriaHembraByIdRequest, CriaHembraDto?>
    {
        private readonly ICriaHembraRepository _repository;
        private readonly IMapper _mapper;

        public GetCriaHembraByIdHandler(ICriaHembraRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<CriaHembraDto?> Handle(GetCriaHembraByIdRequest request, CancellationToken cancellationToken)
        {
            var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
            return entity == null ? null : _mapper.Map<CriaHembraDto>(entity);
        }
    }
}