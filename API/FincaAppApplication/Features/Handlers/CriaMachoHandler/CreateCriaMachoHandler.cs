using AutoMapper;
using FincaAppApplication.Features.Requests.CriaMachoRequest;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.CriaMachoHandler
{
    public class CreateCriaMachoHandler : IRequestHandler<CreateCriaMachoRequest, Guid>
    {
        private readonly ICriaMachoRepository _repository;
        private readonly IMapper _mapper;

        public CreateCriaMachoHandler(ICriaMachoRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Guid> Handle(CreateCriaMachoRequest request, CancellationToken cancellationToken)
        {
            var entity = _mapper.Map<CriaMacho>(request);
            entity.Id = Guid.NewGuid();

            await _repository.AddAsync(entity, cancellationToken);
            return entity.Id;
        }
    }
}
