using AutoMapper;
using FincaAppApplication.Features.Requests.CriaHembraRequest;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using MediatR;

namespace FincaAppApplication.Features.Handlers.CriaHembraHandler
{
    public class UpdateCriaHembraHandler : IRequestHandler<UpdateCriaHembraRequest, Guid>
    {
        private readonly ICriaHembraRepository _repository;
        private readonly IMapper _mapper;

        public UpdateCriaHembraHandler(ICriaHembraRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Guid> Handle(UpdateCriaHembraRequest request, CancellationToken cancellationToken)
        {
            var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
            if (entity == null)
                throw new KeyNotFoundException("Cría hembra no encontrada.");

            _mapper.Map(request.Dto, entity);
            entity.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(entity, cancellationToken);
            return entity.Id;
        }
    }
}