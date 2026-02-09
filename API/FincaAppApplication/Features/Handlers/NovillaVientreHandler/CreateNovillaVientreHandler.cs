using AutoMapper;
using FincaAppApplication.Features.Requests.NovillaVientreRequest;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.NovillaVientreHandler
{
    public class CreateNovillaVientreHandler : IRequestHandler<CreateNovillaVientreRequest, Guid>
    {
        private readonly INovillaVientreRepository _repository;
        private readonly IMapper _mapper;

        public CreateNovillaVientreHandler(INovillaVientreRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Guid> Handle(CreateNovillaVientreRequest request, CancellationToken cancellationToken)
        {
            var entity = _mapper.Map<NovillaVientre>(request);
            await _repository.AddAsync(entity, cancellationToken);
            return entity.Id;
        }
    }
}
