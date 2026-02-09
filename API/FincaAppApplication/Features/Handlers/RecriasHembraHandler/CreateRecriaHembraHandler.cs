using AutoMapper;
using FincaAppApplication.DTOs.RecriaHembra;
using FincaAppApplication.Features.Requests.RecriasHembraRecuest;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using MediatR;

namespace FincaAppApplication.Features.Handlers.RecriasHembraHandler
{
    public class CreateRecriaHembraHandler : IRequestHandler<CreateRecriaHembraRequest, Guid>
    {
        private readonly IRecriaHembraRepository _repository;
        private readonly IMapper _mapper;

        public CreateRecriaHembraHandler(IRecriaHembraRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Guid> Handle(CreateRecriaHembraRequest request, CancellationToken cancellationToken)
        {
            var entity = _mapper.Map<RecriaHembra>(request);
            await _repository.AddAsync(entity, cancellationToken);
            return entity.Id;
        }
    }
}