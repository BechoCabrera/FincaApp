using AutoMapper;
using FincaAppApplication.Features.Requests.RecriasHembraRecuest;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.RecriasHembraHandler
{
    public class UpdateRecriaHembraHandler : IRequestHandler<UpdateRecriaHembraRequest>
    {
        private readonly IRecriaHembraRepository _repository;
        private readonly IMapper _mapper;

        public UpdateRecriaHembraHandler(IRecriaHembraRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task Handle(UpdateRecriaHembraRequest request, CancellationToken cancellationToken)
        {
            var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
            if (entity == null) return;
            _mapper.Map(request.Dto, entity);
            await _repository.UpdateAsync(entity, cancellationToken);
        }
    }
}
