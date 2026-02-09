using AutoMapper;
using FincaAppApplication.DTOs.RecriaHembra;
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
    public class GetRecriaHembraByIdHandler : IRequestHandler<GetRecriaHembraByIdRequest, RecriaHembraDto>
    {
        private readonly IRecriaHembraRepository _repository;
        private readonly IMapper _mapper;

        public GetRecriaHembraByIdHandler(IRecriaHembraRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<RecriaHembraDto> Handle(GetRecriaHembraByIdRequest request, CancellationToken cancellationToken)
        {
            var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
            return entity == null ? null : _mapper.Map<RecriaHembraDto>(entity);
        }
    }
}
