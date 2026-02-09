using AutoMapper;
using FincaAppApplication.DTOs.CriaHembra;
using FincaAppApplication.Features.Requests.CriaHembraRequest;
using FincaAppDomain.Common;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using MediatR;

namespace FincaAppApplication.Features.Handlers.CriaHembraHandler
{
    public class CreateCriaHembraHandler : IRequestHandler<CreateCriaHembraRequest, Guid>
    {
        private readonly ICriaHembraRepository _repository;
        private readonly IMapper _mapper;
        private readonly ITenantProvider _tenantProvider;

        public CreateCriaHembraHandler(ICriaHembraRepository repository, IMapper mapper, ITenantProvider tenantProvider)
        {
            _repository = repository;
            _mapper = mapper;
            _tenantProvider = tenantProvider;
        }

        public async Task<Guid> Handle(CreateCriaHembraRequest request, CancellationToken cancellationToken)
        {
            var entity = _mapper.Map<CriaHembra>(request.Dto);
            entity.Id = Guid.NewGuid();

            await _repository.AddAsync(entity, cancellationToken);
            return entity.Id;
        }
    }
}