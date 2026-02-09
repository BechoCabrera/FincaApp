using AutoMapper;
using FincaAppApplication.Features.Requests.NovillaVientreRequest;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.NovillaVientreHandler
{
    public class UpdateNovillaVientreHandler : IRequestHandler<UpdateNovillaVientreRequest>
    {
        private readonly INovillaVientreRepository _repository;
        private readonly IMapper _mapper;

        public UpdateNovillaVientreHandler(INovillaVientreRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task Handle(UpdateNovillaVientreRequest request, CancellationToken cancellationToken)
        {
            var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
            if (entity == null) return;
            _mapper.Map(request.Dto, entity);
            await _repository.UpdateAsync(entity, cancellationToken);
        }
    }
}
